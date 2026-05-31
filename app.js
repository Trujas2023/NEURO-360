document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('registroForm').addEventListener('submit', (event) => {
        event.preventDefault();
        alert('¡El formulario está conectado correctamente!');
    });
});
