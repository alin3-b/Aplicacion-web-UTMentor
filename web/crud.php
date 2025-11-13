<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>UTmentor - Nuevo Usuario</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-sRIl4kxILFvY47J16cr9ZwB07vP4J8+LH7qKQnuqkuIAvNWLzeN8tE5YBujZqJLB" crossorigin="anonymous">
  </head>   
<body class="bg-light">
<?php
$mensaje = "";

if ($_POST) {
    $campos = ['nombre_completo', 'correo', 'semestre', 'fk_carrera', 'password'];
    $faltan = array_filter($campos, fn($c) => empty($_POST[$c]));
    if ($faltan) {
        $mensaje = "Faltan campos obligatorios";
    } else {
        // === Hash de contraseña (seguridad) ===
        $data = [
            "nombre_completo" => $_POST['nombre_completo'],
            "correo" => $_POST['correo'],
            "semestre" => (int)$_POST['semestre'],
            "fk_carrera" => (int)$_POST['fk_carrera'],
            "password_hash" => password_hash($_POST['password'], PASSWORD_BCRYPT)
        ];

        $json = json_encode($data);
        $ch = curl_init("http://api_srv:3000/api/usuarios");
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $json);
        curl_setopt($ch, CURLOPT_HTTPHEADER, ["Content-Type: application/json"]);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode === 201) {
            $mensaje = "Usuario creado con éxito";
        } else {
            $mensaje = "Error al crear usuario";
        }
    }
}
?>

<div class="container mt-5">
  <div class="row justify-content-center">
    <div class="col-md-6">
      <div class="card shadow-sm">
        <div class="card-header bg-primary text-white">
          <h4 class="mb-0">Registrar Usuario</h4>
        </div>
        <div class="card-body">
          <form method="post">
            <div class="mb-3">
              <label for="nombre_completo" class="form-label">Nombre completo</label>
              <input type="text" class="form-control" id="nombre_completo" name="nombre_completo" placeholder="Juan Pérez" required>
            </div>

            <div class="mb-3">
              <label for="correo" class="form-label">Correo institucional</label>
              <input type="email" class="form-control" id="correo" name="correo" placeholder="juan@ut.edu.mx" required>
            </div>

            <div class="mb-3">
              <label for="semestre" class="form-label">Semestre</label>
              <select class="form-select" id="semestre" name="semestre" required>
                <option value="">Selecciona...</option>
                <?php for ($i = 1; $i <= 10; $i++): ?>
                  <option value="<?= $i ?>"><?= $i ?>° semestre</option>
                <?php endfor; ?>
              </select>
            </div>

            <div class="mb-3">
              <label for="fk_carrera" class="form-label">Carrera</label>
              <select class="form-select" id="fk_carrera" name="fk_carrera" required>
                <option value="">Selecciona...</option>
                <option value="1">Ingeniería Civil</option>
                <option value="2">Ingeniería en Alimentos</option>
                <option value="3">Ingeniería en Computación</option>
                <option value="4">Ingeniería en Diseño</option>
                <option value="5">Ingeniería en Electrónica</option>
                <option value="6">Ingeniería en Física Aplicada</option>
                <option value="7">Ingeniería Industrial</option>
                <option value="8">Ingeniería en Mecánica Automotriz</option>
                <option value="9">Ingeniería en Mecatrónica</option>
                <option value="10">Ingeniería Química en Procesos Sostenibles</option>
                <option value="11">Licenciatura en Ciencias Empresariales</option>
                <option value="12">Licenciatura en Matemáticas Aplicadas</option>
                <option value="13">Licenciatura en Estudios Mexicanos</option>
              </select>
            </div>

            <div class="mb-3">
              <label for="password" class="form-label">Contraseña</label>
              <input type="password" class="form-control" id="password" name="password" placeholder="Mínimo 6 caracteres" required minlength="6">
            </div>

            <div class="d-grid gap-2 d-md-flex justify-content-md-end">
              <a href="index.php" class="btn btn-secondary me-md-2">Cancelar</a>
              <button type="submit" class="btn btn-primary">Crear Usuario</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- Toast de confirmación (igual que tu profe) -->
<div class="position-fixed bottom-0 end-0 p-3" style="z-index: 11">
  <div id="toastConfirmacion" class="toast align-items-center text-white bg-success border-0" role="alert">
    <div class="d-flex">
      <div class="toast-body">
        <?= htmlspecialchars($mensaje) ?>
      </div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
    </div>
  </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js"></script>
<script>
<?php if ($mensaje): ?>
  const toastEl = document.getElementById('toastConfirmacion');
  const toast = new bootstrap.Toast(toastEl, { delay: 4000 });
  toast.show();
<?php endif; ?>
</script>
</body>
</html>