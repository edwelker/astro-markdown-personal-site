export function initMenuModal(btnId: string, dialogId: string, closeId: string) {
  const menuBtn = document.getElementById(btnId);
  const menuDialog = document.getElementById(dialogId) as HTMLDialogElement | null;
  const menuClose = document.getElementById(closeId);

  if (menuBtn && menuDialog && menuClose) {
    menuBtn.addEventListener('click', () => {
      menuDialog.showModal();
    });

    menuClose.addEventListener('click', () => {
      menuDialog.close();
    });

    // Close when clicking outside
    menuDialog.addEventListener('click', (e) => {
      const rect = menuDialog.getBoundingClientRect();
      const isInDialog = (rect.top <= e.clientY && e.clientY <= rect.top + rect.height &&
        rect.left <= e.clientX && e.clientX <= rect.left + rect.width);
      if (!isInDialog) {
        menuDialog.close();
      }
    });

    // Close when clicking any link inside the menu
    const links = menuDialog.querySelectorAll('a');
    links.forEach(link => {
      link.addEventListener('click', () => {
        menuDialog.close();
      });
    });
  }
}
