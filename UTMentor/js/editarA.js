// Obtener elementos
const btnEdit = document.getElementById('btnEdit');
const editModal = document.getElementById('editModal');
const closeEdit = editModal.querySelector('.close');
const cancelBtn = document.getElementById('cancelChanges');

const previewImage = document.getElementById('previewImage');
const changePhotoBtn = document.getElementById('changePhoto');
const photoInput = document.getElementById('photoInput');

// Abrir modal
btnEdit.addEventListener('click', () => {
    editModal.style.display = 'block';
});

// Cerrar modal al hacer clic en la "x"
closeEdit.addEventListener('click', () => {
    editModal.style.display = 'none';
});

// Cerrar modal al hacer clic en cancelar
cancelBtn.addEventListener('click', () => {
    editModal.style.display = 'none';
});

// Cerrar modal si se hace clic fuera del contenido
window.addEventListener('click', (e) => {
    if (e.target === editModal) {
        editModal.style.display = 'none';
    }
});

// Cambiar foto de perfil
changePhotoBtn.addEventListener('click', () => {
    photoInput.click();
});

photoInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = () => {
            previewImage.src = reader.result;
            document.getElementById('profileImage').src = reader.result;
        };
        reader.readAsDataURL(file);
    }
});

// Guardar cambios (solo ejemplo, puedes agregar lógica de guardado real)
document.getElementById('saveChanges').addEventListener('click', () => {
    const name = document.getElementById('editName').value;
    const career = document.getElementById('editCareer').value;
    const semester = document.getElementById('editSemester').value;

    document.getElementById('profileName').textContent = name;
    document.getElementById('profileCareer').textContent = career;
    document.getElementById('profileSemester').textContent = semester;

    editModal.style.display = 'none';
});
