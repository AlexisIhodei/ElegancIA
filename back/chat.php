<?php
ini_set('display_errors', 0);
ini_set('log_errors', 1);
error_reporting(E_ALL);

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");

$archivoInventario = './products.json';

$input = json_decode(file_get_contents('php://input'), true);
$historialRecibido = $input['historial'] ?? [];

if (empty($historialRecibido)) {
    echo json_encode([
        "respuesta" => "Hola! Como puedo ayudarte hoy?",
        "lista" => null,
        "product_id" => null
    ]);
    exit;
}

$jsonProductos = file_exists($archivoInventario) ? file_get_contents($archivoInventario) : "[]";
$inventario = json_decode($jsonProductos, true) ?? [];

$mensajeSistema = [
    "role" => "system",
    "content" => "
Eres un asistente de ventas para una tienda online.

Tu inventario disponible es este JSON EXACTO:
$jsonProductos

Debes responder SIEMPRE con un único JSON válido con esta estrucutra exacta:

{
  \"respuesta\": \"string\",
  \"lista\": [\"string\",...] o null,
  \"product_id\": numero o null
}

Reglas ESTRICTAS:
- RESPONDE ÚNICAMENTE CON EL JSON, NADA MAS.
- NUNCA uses bloques de código, NUNCA uses comillas triples, NUNCA uses markdown.
- NUNCA pongas texto antes ni después del JSON.
- Tu respuesta debe empezar exactamente con { y terminar exactamente con }
- SOLO puedes recomendar productos que existan en el inventario.
- 'respuesta' es un texto corto para el usuario.
- 'lista' debe contener NOMBRES EXACTOS de los productos recomendados. Si no hay lista, usa null.
- NO inventes productos que no estén en el JSON.
- Lo UNICO que puedes inventar es horarios, lugares donde se encuentra la tienda, cuantos empleados tenemos, envios y costos de envio, colores del producto que tengan relacion con el producto.
- 'product_id': si el usuario pide VER o MOSTRAR un producto específico, DEBES poner su ID EXACTO (tal cual aparece en el JSON). Si no es un producto específico, usa null.
- NO envíes HTML ni texto fuera del JSON.
- NO agregues texto fuera del JSON.
- NO HTML ni etiquetas.
- Ajusta la respuesta según la intención del usuario: 
   - Si pregunta algo general → 'lista' null
   - Si pide recomendaciones → rellena 'lista' con productos del inventario
"
];

$mensajesParaGroq = array_merge([$mensajeSistema], $historialRecibido);

$payload = [
    "model" => "llama-3.1-8b-instant",
    "messages" => $mensajesParaGroq,
    "temperature" => 0.3,
    "response_format" => ["type" => "json_object"]
];

$opciones = [
    'http' => [
        'method' => 'POST',
        'header' => "Content-Type: application/json\r\n" .
            "Authorization: Bearer " . $apiKey . "\r\n",
        'content' => json_encode($payload),
        'ignore_errors' => true
    ]
];

$contexto = stream_context_create($opciones);
$respuestaHttp = file_get_contents('https://api.groq.com/openai/v1/chat/completions', false, $contexto);

if ($respuestaHttp === FALSE) {
    echo json_encode([
        "respuesta" => "Error de conexión con la IA. Intenta de nuevo.",
        "lista" => null,
        "product_id" => null
    ]);
    exit;
}

$datos = json_decode($respuestaHttp, true);

if (!isset($datos['choices'][0]['message']['content'])) {
    echo json_encode([
        "respuesta" => "No se recibió respuesta de la IA.",
        "lista" => null,
        "product_id" => null
    ]);
    exit;
}

$textoFinal = $datos['choices'][0]['message']['content'];

$jsonLimpio = json_decode($textoFinal, true);

if (!$jsonLimpio) {
    $sinMarkdown = preg_replace('/^```(?:json)?\s*/i', '', trim($textoFinal));
    $sinMarkdown = preg_replace('/\s*```$/', '', $sinMarkdown);
    $jsonLimpio = json_decode(trim($sinMarkdown), true);
}

if (!$jsonLimpio) {
    if (preg_match('/\{[\s\S]*\}/u', $textoFinal, $match)) {
        $jsonLimpio = json_decode($match[0], true);
    }
}

if (!$jsonLimpio) {
    $reparado = preg_replace('/,\s*([\}\]])/u', '$1', $textoFinal);
    if (preg_match('/\{[\s\S]*\}/u', $reparado, $match)) {
        $jsonLimpio = json_decode($match[0], true);
    }
}

if (!$jsonLimpio) {
    $textoSeguro = mb_substr(strip_tags($textoFinal), 0, 500);
    $jsonLimpio = [
        "respuesta" => $textoSeguro ?: "No se pudo procesar la respuesta.",
        "lista" => null,
        "product_id" => null
    ];
}

$respuesta = isset($jsonLimpio['respuesta']) ? (string) $jsonLimpio['respuesta'] : "Sin respuesta.";
$lista = isset($jsonLimpio['lista']) && is_array($jsonLimpio['lista']) ? $jsonLimpio['lista'] : null;
$product_id = isset($jsonLimpio['product_id']) ? $jsonLimpio['product_id'] : null;

echo json_encode([
    "respuesta" => $respuesta,
    "lista" => $lista,
    "product_id" => $product_id
], JSON_UNESCAPED_UNICODE);
?>