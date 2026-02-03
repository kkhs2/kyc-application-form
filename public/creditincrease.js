/* VDD email address disable input */
const inputs = [...document.getElementsByTagName("kyc-input")];
const email = inputs.find(
  (i) => i.getAttribute("data-name") === "EmailAddress"
);

if (email) {
  const emailInput = email.shadowRoot;
  emailInput.querySelector('input').disabled = true;
}
const accordions = document.querySelectorAll("accordion-tab");

const creditRequirementsAccordion = [...accordions].find(a => (a.getAttribute("data-title") == "Credit Requirements"));
    
if (creditRequirementsAccordion) {
  const paragraphs = creditRequirementsAccordion.querySelectorAll("p");
  const currentCreditLimit = paragraphs[0].querySelector("strong").textContent;
  
} 
