document.addEventListener('DOMContentLoaded', () => {
    const sessionInfo = document.getElementById('session-info');

    document.querySelectorAll('.day').forEach(day => {
        day.addEventListener('click', (e) => {
            const details = day.querySelector('.session-details');
            const isOpen = details && details.style.display === 'block';

            // Cerrar todos los detalles primero
            document.querySelectorAll('.session-details').forEach(d => d.style.display = 'none');

            // Si estaba cerrado, abrirlo; si estaba abierto, se queda cerrado
            if (!isOpen && details) {
                details.style.display = 'block';
            }
        });
    });

    // Clic fuera de días cierra todo
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.day')) {
            document.querySelectorAll('.session-details').forEach(d => d.style.display = 'none');
        }
    });
});
