<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");



$archivoInventario = './products.json';

$input = json_decode(file_get_contents('php://input'), true);
$historialRecibido = $input['historial'] ?? [];

if (empty($historialRecibido)) {
    echo json_encode(['respuesta' => 'Hola, ¿en qué puedo ayudarte hoy?']);
    exit;
}

$jsonProductos = file_exists($archivoInventario) ? file_get_contents($archivoInventario) : "[]";

$mensajeSistema = [
    "role" => "system",
    "content" => "Eres un asistente de ventas. Tu inventario es: $jsonProductos. 
                  Reglas importantes:
- Debes responder SIEMPRE en formato JSON válido.
- El JSON debe tener exactamente esta estructura:
{
  \"respuesta\": \"texto para el usuario\",
  \"product_id\": numero_o_null
}
- Si recomiendas un producto, incluye su id real en product_id.
- Si no recomiendas ninguno, usa product_id: null.
- NO expliques el formato.
- NO agregues texto fuera del JSON.
- El inventario disponible es: $jsonProductos
"
];

$mensajesParaGroq = array_merge([$mensajeSistema], $historialRecibido);

$payload = [
    "model" => "llama-3.1-8b-instant",
    "messages" => $mensajesParaGroq,
    "temperature" => 0.5
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
$respuesta = file_get_contents('https://api.groq.com/openai/v1/chat/completions', false, $contexto);


if ($respuesta === FALSE) {
    echo json_encode(['respuesta' => 'Error de conexión con la IA.']);
} else {
    $datos = json_decode($respuesta, true);
    $textoFinal = $datos['choices'][0]['message']['content'] ?? 'Error procesando.';
    $jsonLimpio = json_decode($textoFinal, true);
    if ($jsonLimpio) {
        echo json_encode($jsonLimpio);
    } else {
        echo json_encode([
            "respuesta" => "Error procesando respuesta.",
            "product_id" => null
        ]);
    }
}
?>