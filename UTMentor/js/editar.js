document.addEventListener('DOMContentLoaded', () => {
    const btnEdit = document.getElementById('btnEdit');
    const modal = document.getElementById('editModal');
    const closeModal = document.querySelector('.close');
    const cancelBtn = document.getElementById('cancelChanges');

    const profileName = document.getElementById('profileName');
    const profileCareer = document.getElementById('profileCareer');
    const profileSemester = document.getElementById('profileSemester');
    const profileTopics = document.getElementById('profileTopics');
    const profileImage = document.getElementById('profileImage');
    const profileEmail = document.getElementById('profileEmail');

    const editName = document.getElementById('editName');
    const editCareer = document.getElementById('editCareer');
    const editSemester = document.getElementById('editSemester');
    const editEmail = document.getElementById('editEmail');
    const editTopics = document.getElementById('editTopics');
    const previewImage = document.getElementById('previewImage');

    const changePhoto = document.getElementById('changePhoto');
    const photoInput = document.getElementById('photoInput');
    const saveChanges = document.getElementById('saveChanges');

    if (!btnEdit || !modal) return;

    // Abrir modal
    btnEdit.addEventListener('click', () => {
        editName.value = profileName.textContent.trim();
        editCareer.value = profileCareer.textContent.trim();
        editSemester.value = profileSemester.textContent.trim();
        editEmail.value = profileEmail.textContent.trim();

        const topics = Array.from(profileTopics.querySelectorAll('ul li')).map(li => li.textContent);
        editTopics.value = topics.join(', ');

        previewImage.src = profileImage.src;
        modal.style.display = 'block';
    });

    // Cerrar modal
    const closeModalFunc = () => modal.style.display = 'none';
    closeModal.addEventListener('click', closeModalFunc);
    cancelBtn.addEventListener('click', closeModalFunc);
    window.addEventListener('click', e => { if (e.target == modal) closeModalFunc(); });

    // Cambiar foto
    changePhoto.addEventListener('click', () => photoInput.click());
    photoInput.addEventListener('change', e => {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = () => previewImage.src = reader.result;
            reader.readAsDataURL(file);
        } else {
            alert('Seleccione un archivo de imagen válido');
        }
    });

    // Guardar cambios
    saveChanges.addEventListener('click', () => {
        profileName.textContent = editName.value;
        profileCareer.textContent = editCareer.value;
        profileSemester.textContent = editSemester.value;

        const topicsList = editTopics.value.split(',').map(t => t.trim()).filter(t => t !== '');
        const ul = document.createElement('ul');
        topicsList.forEach(t => {
            const li = document.createElement('li');
            li.textContent = t;
            ul.appendChild(li);
        });
        profileTopics.replaceChild(ul, profileTopics.querySelector('ul'));

        profileImage.src = previewImage.src;

        modal.style.display = 'none';
        alert('Perfil actualizado con éxito');
    });
});
