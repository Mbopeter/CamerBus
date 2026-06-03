<?php
declare(strict_types=1);

class Router
{
    private array $routes = [];

    public function get(string $path, callable|string $handler): void { $this->add('GET', $path, $handler); }
    public function post(string $path, callable|string $handler): void { $this->add('POST', $path, $handler); }
    public function put(string $path, callable|string $handler): void { $this->add('PUT', $path, $handler); }
    public function delete(string $path, callable|string $handler): void { $this->add('DELETE', $path, $handler); }

    private function add(string $method, string $path, callable|string $handler): void
    {
        // Convert /api/users/{id} to regex: /api/users/(?P<id>[^/]+)
        $pattern = preg_replace('/\{([a-zA-Z0-9_]+)\}/', '(?P<\1>[^/]+)', $path);
        $pattern = '#^' . $pattern . '$#';
        
        $this->routes[] = [
            'method' => $method,
            'pattern' => $pattern,
            'handler' => $handler,
        ];
    }

    public function dispatch(string $method, string $uri): void
    {
        // Strip base path if exists
        $basePath = '/camerbus-api';
        if (str_starts_with($uri, $basePath)) {
            $uri = substr($uri, strlen($basePath));
        }
        $uri = trim($uri, '/');
        // Prepend slash to ensure regex matches
        $uri = '/' . $uri;

        foreach ($this->routes as $route) {
            if ($route['method'] === $method && preg_match($route['pattern'], $uri, $matches)) {
                // Extract named parameters
                $params = [];
                foreach ($matches as $key => $value) {
                    if (is_string($key)) {
                        $params[$key] = $value;
                    }
                }

                // Handle Closure
                if ($route['handler'] instanceof Closure) {
                    call_user_func($route['handler']);
                    return;
                }

                // Parse handler 'Controller::method' or 'Controller@method'
                $handler = str_replace('@', '::', $route['handler']);
                [$class, $methodName] = explode('::', $handler);

                // Body parsing for POST/PUT
                $body = [];
                if (in_array($method, ['POST', 'PUT', 'PATCH'])) {
                    $body = json_decode(file_get_contents('php://input'), true) ?? [];
                }

                // Inject dependencies using Reflection
                if (class_exists($class) && method_exists($class, $methodName)) {
                    $reflection = new ReflectionMethod($class, $methodName);
                    $args = [];
                    foreach ($reflection->getParameters() as $param) {
                        $name = $param->getName();
                        if ($name === 'body') {
                            $args[] = $body;
                        } elseif (array_key_exists($name, $params)) {
                            $type = $param->getType();
                            $val = $params[$name];
                            if ($type && $type->getName() === 'int') {
                                $val = (int) $val;
                            }
                            $args[] = $val;
                        } else {
                            $args[] = null;
                        }
                    }

                    call_user_func_array([$class, $methodName], $args);
                    return;
                } else {
                    Response::error('Handler not found: ' . $handler, 500);
                }
            }
        }

        Response::error('Endpoint not found', 404);
    }
}
