document.addEventListener('DOMContentLoaded', () => {
    const downloadSanAIBtn = document.querySelector('#download-sanai');

    downloadSanAIBtn.addEventListener('click', () => {
        Toastify({
            text: "Em breve!",
            duration: 3000,
            gravity: "bottom",
            position: "left",
            stopOnFocus: true,
            style: {
                background: "linear-gradient(to left, rgb(167, 0, 0), rgb(226, 0, 0), rgb(255, 0, 0))",
            },
        }).showToast();
    });
});