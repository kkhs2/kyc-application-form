
const nextButtons = [...document.getElementsByTagName("next-button")];

nextButtons.forEach(button => {
  button.addEventListener('click', (e) => {
    const errors = window.iterateForErrors();
    console.log(errors);
  });
});