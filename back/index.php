<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");

$apiKey = getenv('GROQ_API_KEY');
$archivoInventario = 'products.json';

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
                  Reglas: Si no hay stock, dilo. Sé breve. 
                  IMPORTANTE: Recuerda lo que el usuario te ha dicho antes en esta conversación."
];

$mensajesParaGroq = array_merge([$mensajeSistema], $historialRecibido);

$payload = [
    "model" => "llama3-8b-8192",
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
    echo json_encode(['respuesta' => $textoFinal]);
}
?>