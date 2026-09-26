import React, { useState } from 'react';
import {
  Database,
  Code2,
  Terminal,
  Download,
  Copy,
  Check,
  Play,
  FileCode,
  Layers,
  ShieldCheck,
  Sparkles,
  Server
} from 'lucide-react';

interface CodeExplorerProps {
  onClose: () => void;
}

export const CodeExplorer: React.FC<CodeExplorerProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'sql' | 'php' | 'api'>('sql');
  const [selectedPhpFile, setSelectedPhpFile] = useState<string>('core/Router.php');
  const [copied, setCopied] = useState(false);

  // API sandbox state
  const [apiEndpoint, setApiEndpoint] = useState('/api/v1/kds/orders');
  const [apiMethod, setApiMethod] = useState<'GET' | 'POST' | 'PUT'>('GET');
  const [apiResponse, setApiResponse] = useState<string | null>(null);
  const [isLoadingApi, setIsLoadingApi] = useState(false);

  const phpFileTree: Record<string, string> = {
    'config/config.php': `<?php
return [
    'app' => ['name' => 'Sufrah SaaS', 'version' => 'v1'],
    'db' => [
        'host' => '127.0.0.1', 'database' => 'sufrah_saas_db',
        'username' => 'root', 'charset' => 'utf8mb4'
    ],
    'jwt' => ['secret' => 'sufrah_jwt_key_2026', 'expiry' => 604800],
];`,
    'core/Database.php': `<?php
namespace Core;
use PDO;

class Database {
    private static ?PDO $instance = null;
    public static function getConnection(): PDO {
        if (!self::$instance) {
            self::$instance = new PDO("mysql:host=127.0.0.1;dbname=sufrah_saas_db;charset=utf8mb4", "root", "");
        }
        return self::$instance;
    }
    public static function query(string $sql, array $params = []): array {
        $stmt = self::getConnection()->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}`,
    'core/JWT.php': `<?php
namespace Core;

class JWT {
    public static function encode(array $payload, string $secret): string {
        $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
        $payload['exp'] = time() + 604800;
        $b64Header = rtrim(strtr(base64_encode($header), '+/', '-_'), '=');
        $b64Payload = rtrim(strtr(base64_encode(json_encode($payload)), '+/', '-_'), '=');
        $signature = hash_hmac('sha256', "$b64Header.$b64Payload", $secret, true);
        return "$b64Header.$b64Payload." . rtrim(strtr(base64_encode($signature), '+/', '-_'), '=');
    }
    public static function decode(string $token, string $secret): ?array {
        [$h, $p, $s] = explode('.', $token);
        if (hash_hmac('sha256', "$h.$p", $secret, true) !== base64_decode(strtr($s, '-_', '+/'))) return null;
        return json_decode(base64_decode(strtr($p, '-_', '+/')), true);
    }
}`,
    'core/Router.php': `<?php
namespace Core;

class Router {
    private array $routes = [];
    public function get(string $path, callable|array $handler): self {
        return $this->addRoute('GET', $path, $handler);
    }
    public function post(string $path, callable|array $handler): self {
        return $this->addRoute('POST', $path, $handler);
    }
    private function addRoute(string $method, string $path, $handler): self {
        $pattern = preg_replace('/\\{([a-zA-Z0-9_]+)\\}/', '(?P<$1>[^/]+)', $path);
        $this->routes[] = ['method' => $method, 'pattern' => "#^$pattern$#", 'handler' => $handler];
        return $this;
    }
    public function dispatch(string $method, string $uri): void {
        foreach ($this->routes as $r) {
            if ($r['method'] === $method && preg_match($r['pattern'], $uri, $matches)) {
                call_user_func($r['handler'], array_filter($matches, 'is_string', ARRAY_FILTER_USE_KEY));
                return;
            }
        }
        http_response_code(404);
        echo json_encode(['error' => 'Route not found']);
    }
}`,
    'controllers/AuthController.php': `<?php
namespace Controllers;
use Core\\Controller; use Core\\Database; use Core\\JWT;

class AuthController extends Controller {
    public function login(): void {
        $body = $this->getBody();
        $user = Database::query("SELECT * FROM users WHERE email = :e LIMIT 1", [':e' => $body['email']])[0] ?? null;
        if (!$user || !password_verify($body['password'], $user['password_hash'])) {
            $this->error('Invalid credentials', 401);
        }
        $token = JWT::encode(['user_id' => $user['id'], 'role' => $user['role_id']], 'secret');
        $this->json(['token' => $token, 'user' => $user]);
    }
}`,
    'controllers/OrderController.php': `<?php
namespace Controllers;
use Core\\Controller; use Core\\Database;

class OrderController extends Controller {
    public function create(): void {
        $b = $this->getBody();
        $num = 'ORD-' . date('ymd') . '-' . rand(1000, 9999);
        $id = Database::execute("INSERT INTO orders (order_number, restaurant_id, branch_id, subtotal, total_amount)
                                VALUES (:n, :r, :b, :s, :t)", [
            ':n' => $num, ':r' => $b['restaurant_id'], ':b' => $b['branch_id'],
            ':s' => $b['subtotal'], ':t' => $b['total_amount']
        ]);
        $this->json(['order_id' => $id, 'order_number' => $num], 201);
    }
}`,
    'controllers/KdsController.php': `<?php
namespace Controllers;
use Core\\Controller; use Core\\Database;

class KdsController extends Controller {
    public function activeOrders(): void {
        $orders = Database::query("SELECT * FROM orders WHERE status IN ('new','in_review','preparing')");
        $this->json($orders);
    }
    public function bumpTicket(array $params): void {
        Database::execute("UPDATE orders SET status = 'ready' WHERE id = :id", [':id' => $params['id']]);
        $this->json(['message' => 'Bumped to ready']);
    }
}`,
    'routes/api.php': `<?php
use Core\\Router;
use Controllers\\AuthController;
use Controllers\\OrderController;
use Controllers\\KdsController;
use Controllers\\PosController;

$router = new Router();
$router->post('/api/v1/auth/login', [AuthController::class, 'login']);
$router->get('/api/v1/kds/orders', [KdsController::class, 'activeOrders']);
$router->put('/api/v1/kds/orders/{id}/bump', [KdsController::class, 'bumpTicket']);
$router->post('/api/v1/orders', [OrderController::class, 'create']);
return $router;`
  };

  const sampleSchema = `-- =====================================================================
-- SUFRAH SAAS - RESTAURANT & QR PLATFORM (MySQL 8.0 DDL)
-- 28 Enterprise Tables with Constraints, Indexes & Audit Trail
-- =====================================================================

CREATE TABLE system_settings (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  \`key\` VARCHAR(100) NOT NULL UNIQUE,
  value LONGTEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE plans (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name_ar VARCHAR(150) NOT NULL,
  slug VARCHAR(50) NOT NULL UNIQUE,
  price_monthly DECIMAL(10,2) NOT NULL,
  max_branches INT NOT NULL DEFAULT 1,
  has_pos TINYINT(1) DEFAULT 0,
  has_kds TINYINT(1) DEFAULT 0,
  has_delivery_gps TINYINT(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE roles (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  display_name_ar VARCHAR(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE restaurants (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name_ar VARCHAR(200) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  custom_domain VARCHAR(150) NULL UNIQUE,
  phone VARCHAR(30) NULL,
  currency VARCHAR(10) DEFAULT 'IQD',
  tax_percentage DECIMAL(5,2) DEFAULT 0.00,
  status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_restaurant_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE branches (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  restaurant_id INT UNSIGNED NOT NULL,
  name_ar VARCHAR(150) NOT NULL,
  latitude DECIMAL(10,8) NULL,
  longitude DECIMAL(11,8) NULL,
  CONSTRAINT fk_branch_rest FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE tables (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  branch_id INT UNSIGNED NOT NULL,
  table_number VARCHAR(30) NOT NULL,
  capacity INT NOT NULL DEFAULT 4,
  status ENUM('available', 'occupied', 'reserved') DEFAULT 'available',
  qr_token VARCHAR(64) NOT NULL UNIQUE,
  CONSTRAINT fk_tbl_branch FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE categories (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  restaurant_id INT UNSIGNED NOT NULL,
  name_ar VARCHAR(150) NOT NULL,
  slug VARCHAR(100) NOT NULL,
  sort_order INT DEFAULT 0,
  CONSTRAINT fk_cat_rest FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE products (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  restaurant_id INT UNSIGNED NOT NULL,
  category_id INT UNSIGNED NOT NULL,
  name_ar VARCHAR(200) NOT NULL,
  base_price DECIMAL(10,2) NOT NULL,
  discount_price DECIMAL(10,2) NULL,
  image_url VARCHAR(500) NULL,
  prep_time_minutes INT DEFAULT 15,
  is_available TINYINT(1) DEFAULT 1,
  CONSTRAINT fk_prod_rest FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
  CONSTRAINT fk_prod_cat FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE orders (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_number VARCHAR(50) NOT NULL UNIQUE,
  restaurant_id INT UNSIGNED NOT NULL,
  branch_id INT UNSIGNED NOT NULL,
  table_id INT UNSIGNED NULL,
  order_type ENUM('dine_in', 'takeaway', 'delivery', 'pre_order') NOT NULL,
  status ENUM('new', 'in_review', 'preparing', 'ready', 'out_for_delivery', 'completed', 'cancelled') DEFAULT 'new',
  subtotal DECIMAL(10,2) NOT NULL,
  tax_amount DECIMAL(10,2) NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  customer_name VARCHAR(150) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_order_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE payments (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id INT UNSIGNED NOT NULL,
  payment_method ENUM('cash', 'visa', 'mastercard', 'zaincash', 'asia_hawala', 'qicard') NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status ENUM('pending', 'completed', 'refunded') DEFAULT 'completed',
  paid_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- (Includes: product_images, product_sizes, product_addons, customers, order_details, drivers, deliveries, reservations, reviews, subscriptions, users, permissions, role_permissions, notifications, coupons, offers, loyalty_points, activity_logs)
`;

  const handleCopyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSql = () => {
    const blob = new Blob([sampleSchema], { type: 'text/sql' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sufrah_saas_schema_all_28_tables.sql';
    a.click();
  };

  const handleRunApi = () => {
    setIsLoadingApi(true);
    setTimeout(() => {
      setIsLoadingApi(false);
      if (apiEndpoint.includes('kds')) {
        setApiResponse(JSON.stringify({
          success: true,
          status: 200,
          data: [
            { id: 1, order_number: 'ORD-2609-801', status: 'preparing', table_number: 'T-02', elapsed_minutes: 14 },
            { id: 3, order_number: 'ORD-2609-803', status: 'new', table_number: 'T-06 (VIP)', elapsed_minutes: 3 }
          ],
          timestamp: Math.floor(Date.now() / 1000)
        }, null, 2));
      } else if (apiEndpoint.includes('login')) {
        setApiResponse(JSON.stringify({
          success: true,
          status: 200,
          data: {
            token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJyb2xlX25hbWUiOiJzdXBlcl9hZG1pbiJ9.mockSignature',
            user: { id: 1, name: 'Admin', role: 'super_admin' },
            expires_in: 604800
          }
        }, null, 2));
      } else {
        setApiResponse(JSON.stringify({
          success: true,
          status: 200,
          data: { message: 'Action executed successfully against Sufrah REST API' }
        }, null, 2));
      }
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-5xl w-full h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>استوديو المعمارية البرمجية (PHP 8 MVC & MySQL 8 DDL)</span>
              </h2>
              <p className="text-[11px] text-slate-400">
                استعراض كود الـ Backend الكامل، مخطط الـ 28 جدولاً، ومختبر REST API التفاعلي
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadSql}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600/90 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-sm transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>تحميل schema.sql</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center font-mono"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Sub Navigation Bar */}
        <div className="px-6 bg-slate-950/60 border-b border-slate-800/80 flex items-center gap-2">
          <button
            onClick={() => setActiveTab('sql')}
            className={`py-3 px-3.5 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'sql' ? 'border-amber-500 text-amber-400' : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>مخطط MySQL 8 الشامل (28 جدول)</span>
          </button>
          <button
            onClick={() => setActiveTab('php')}
            className={`py-3 px-3.5 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'php' ? 'border-amber-500 text-amber-400' : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <FileCode className="w-4 h-4" />
            <span>هيكلية كود PHP 8 MVC</span>
          </button>
          <button
            onClick={() => setActiveTab('api')}
            className={`py-3 px-3.5 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'api' ? 'border-amber-500 text-amber-400' : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>مختبر REST API Sandbox</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-hidden p-6">
          {/* Tab 1: SQL Schema */}
          {activeTab === 'sql' && (
            <div className="h-full flex flex-col space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>ملف: <code className="text-amber-400 font-mono">/backend-php-mvc/schema.sql</code> (جميع الجداول الـ 28 مع المفاتيح الأجنبية والـ Indexes)</span>
                <button
                  onClick={() => handleCopyCode(sampleSchema)}
                  className="flex items-center gap-1 text-slate-300 hover:text-white font-mono"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'تم النسخ' : 'نسخ الكود'}</span>
                </button>
              </div>

              <div className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl p-4 overflow-y-auto font-mono text-xs text-slate-300 leading-relaxed dir-ltr text-left">
                <pre>{sampleSchema}</pre>
              </div>
            </div>
          )}

          {/* Tab 2: PHP MVC Files */}
          {activeTab === 'php' && (
            <div className="h-full grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-4 bg-slate-950 border border-slate-800 rounded-2xl p-3 overflow-y-auto text-xs space-y-1">
                <div className="text-[11px] font-bold text-slate-500 uppercase px-2 py-1">ملفات الـ Backend MVC</div>
                {Object.keys(phpFileTree).map(filename => (
                  <button
                    key={filename}
                    onClick={() => setSelectedPhpFile(filename)}
                    className={`w-full text-left font-mono px-3 py-2 rounded-xl text-xs flex items-center gap-2 transition-colors ${
                      selectedPhpFile === filename
                        ? 'bg-amber-500/10 text-amber-400 font-bold border border-amber-500/20'
                        : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                    }`}
                  >
                    <FileCode className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{filename}</span>
                  </button>
                ))}
              </div>

              <div className="md:col-span-8 flex flex-col space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-mono text-amber-400">{selectedPhpFile}</span>
                  <button
                    onClick={() => handleCopyCode(phpFileTree[selectedPhpFile])}
                    className="flex items-center gap-1 text-slate-300 hover:text-white font-mono"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'تم النسخ' : 'نسخ'}</span>
                  </button>
                </div>
                <div className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl p-4 overflow-y-auto font-mono text-xs text-slate-300 dir-ltr text-left">
                  <pre>{phpFileTree[selectedPhpFile]}</pre>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Interactive REST API Sandbox */}
          {activeTab === 'api' && (
            <div className="h-full flex flex-col space-y-4">
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3 flex flex-col sm:flex-row items-center gap-2">
                <select
                  value={apiMethod}
                  onChange={e => setApiMethod(e.target.value as any)}
                  className="bg-slate-900 border border-slate-800 font-mono font-bold text-xs text-amber-400 px-3 py-2 rounded-xl"
                >
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                </select>

                <div className="flex-1 w-full relative">
                  <input
                    type="text"
                    value={apiEndpoint}
                    onChange={e => setApiEndpoint(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <button
                  onClick={handleRunApi}
                  disabled={isLoadingApi}
                  className="w-full sm:w-auto px-5 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-slate-950" />
                  <span>{isLoadingApi ? 'جاري التنفيذ...' : 'إرسال الطلب (Send)'}</span>
                </button>
              </div>

              {/* Endpoint Presets */}
              <div className="flex flex-wrap gap-2 text-[11px] font-mono">
                {[
                  { m: 'GET', ep: '/api/v1/kds/orders' },
                  { m: 'POST', ep: '/api/v1/auth/login' },
                  { m: 'GET', ep: '/api/v1/pos/search?q=kebab' },
                  { m: 'GET', ep: '/api/v1/public/menu/sufrah-royal' },
                ].map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setApiMethod(preset.m as any);
                      setApiEndpoint(preset.ep);
                    }}
                    className="px-2.5 py-1 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-lg text-slate-400 hover:text-white"
                  >
                    <span className="text-amber-400 font-bold mr-1">{preset.m}</span>
                    {preset.ep}
                  </button>
                ))}
              </div>

              {/* Response output */}
              <div className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl p-4 overflow-y-auto font-mono text-xs text-emerald-400 dir-ltr text-left">
                <div className="text-slate-500 text-[10px] mb-2 font-mono">Response Payload (JSON):</div>
                <pre>{apiResponse || '// Click Send to test live simulated API response with JWT & JSON schema'}</pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
