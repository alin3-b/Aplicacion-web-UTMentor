<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>UTmentor - Usuarios</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-sRIl4kxILFvY47J16cr9ZwB07vP4J8+LH7qKQnuqkuIAvNWLzeN8tE5YBujZqJLB" crossorigin="anonymous">
  </head>   
<body class="bg-light">
<div class="container mt-5">
  <h1 class="mb-4">Usuarios UTmentor</h1>

  <?php

  $api = "http://api_srv:3000/api/usuarios";
  $data = @file_get_contents($api);
  $usuarios = $data ? json_decode($data, true) : [];
  ?>

  <div class="table-responsive">
    <table class="table table-striped table-hover align-middle">
      <thead class="table-dark">
        <tr>
          <th>ID</th>
          <th>Nombre</th>
          <th>Correo</th>
          <th>Semestre</th>
          <th>Carrera</th>
          <th>Rol</th>
        </tr>
      </thead>
      <tbody>
        <?php if (empty($usuarios)): ?>
          <tr>
            <td colspan="6" class="text-center text-muted py-4">
              No hay usuarios registrados aún.
            </td>
          </tr>
        <?php else: ?>
          <?php foreach ($usuarios as $u): ?>
            <tr>
              <td><?= htmlspecialchars($u['id_usuario']) ?></td>
              <td><?= htmlspecialchars($u['nombre_completo']) ?></td>
              <td><?= htmlspecialchars($u['correo']) ?></td>
              <td><?= htmlspecialchars($u['semestre']) ?></td>
              <td><?= htmlspecialchars($u['nombre_carrera'] ?? '—') ?></td>
              <td><?= htmlspecialchars($u['nombre_rol'] ?? '—') ?></td>
            </tr>
          <?php endforeach; ?>
        <?php endif; ?>
      </tbody>
    </table>
  </div>

  <div class="mt-4">
    <a href="crud.php" class="btn btn-primary btn-lg">Agregar usuario</a>
  </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>