/* 
We need to add text with a checkbox to the process to confirm the customer is the account holder and the payer. If not they cannot proceed and copy must be made available for printing.
For confirm the person is the only person required to authorise debit from the account.  If they say No, then we need to stop the process and provide a mechanism to send them the mandate to complete (email to them or provide link for them to download).  
We need to add text with a checkbox to confirm the bank details (bank details shown to customer and they tick to agree they are correct / or just a text box to agree that details previously provided are correct).
Optional - show the notice period
Optional - advise company name that will appear against the DD.
Where the customer downloads the data they entered. We need to change this from using a mandate to be a confirmation letter

*/


window.__currentNextClick = null;
window.__copAutoAdvance = false;
window.__copResumeInProgress = false;

const bankSectionNextButton = document.getElementById("bankSectionNextButton");
const sections = [...document.getElementsByTagName("accordion-tab")];
const confirmAccountHolder = document.getElementById("confirmAccountHolder");
const inputs = [...document.getElementsByTagName("kyc-input")];

const bankSection = sections.find(
  (s) => s.getAttribute("data-title") == "Bank Details"
);

const businessTradingSection = sections.find(
  (s) => s.getAttribute("data-title") == "Business / Trading Information"
);

const guarantorCheckbox = inputs.find(
  (i) => i.getAttribute("data-name") === "guarantorsCheckbox"
);


    const guarantorInput = guarantorCheckbox.shadowRoot;
    guarantorInput.addEventListener('change', () => {
       let isGuarantorChecked = guarantorInput.querySelector('input').checked;
       if (isGuarantorChecked) {
        document.getElementById("confirmAccountHolderUrl").href = "/Credit-Agreement-EMBEDDED-No-Visable-Fields-V5-withDDI-withguarantee-withguarantor.pdf";
       } else {
        document.getElementById("confirmAccountHolderUrl").href = "/Credit-Agreement-EMBEDDED-No-Visable-Fields-V5-withDDI-withguarantee-noguarantor.pdf";
       }
    });


const bankVerificationErrorContainer = document.getElementById(
  "bankVerificationErrorContainer"   
);
bankVerificationErrorContainer.classList.add("d-none");

const nextButtons = [...document.getElementsByTagName("next-button")];

const toggleBankDetailsContent = () => {
  const bankWhiteContainers = [...bankSection.getElementsByTagName("white-container")];
    bankWhiteContainers.map(container => {
      if (container.id !== "confirmAccountHolderPayer" && container.id !== "bankVerificationErrorContainer") {container.classList.toggle('d-none')};
    });
    const bankKycInputs = [...bankSection.getElementsByTagName("kyc-input")];
    bankKycInputs.map(input => { 
      if (input.id !== "confirmAccountHolder") {input.classList.toggle('d-none');}
    });
    const bankKycNote = [...bankSection.getElementsByTagName("kyc-note")];
    bankKycNote.map(note => note.classList.toggle('d-none'));
    bankSectionNextButton.classList.toggle('d-none');
}

toggleBankDetailsContent();
const companyName = businessTradingSection.getAttribute("data-value");

confirmAccountHolder.addEventListener('click', () => {
    // function to unhide the entire Bank Details section
    toggleBankDetailsContent();
});

document.addEventListener(
  "click",
  async (e) => {
    const path = e.composedPath();

    const bankBtn = path.find((el) => el?.id === "bankSectionNextButton");

    if (!bankBtn) return;

    if (window.__copResumeInProgress) {
      window.__copResumeInProgress = false;
      return;
    }

    e.stopImmediatePropagation();
    e.preventDefault();
    if (window.iterateForErrors()) {
      const bankTab = document.querySelector('accordion-tab[data-title="Bank Details"]');
      const errorFields = [...bankTab?.querySelectorAll("kyc-input")];
      const firstErrorField = errorFields.find(
        el => el.getAttribute("data-error") === "true"
      );
      firstErrorField?.scrollIntoView({
        behavior: "smooth",
        block: "start", 
      }, 800);
      return;
    } 

    const bankVerify = await runCopVerification();

    if (bankVerify?.match !== true) {
      console.log("Bank step: CoP verification failed");
      bankVerificationErrorContainer.classList.remove("d-none");
      const bankTab = document.querySelector(
        'accordion-tab[data-title="Bank Details"]'
      );

      const firstInput = bankTab?.querySelector("kyc-input");
      firstInput?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      return;
    }

    window.__copResumeInProgress = true;

    bankVerificationErrorContainer.classList.add("d-none");

    const innerButton = bankBtn.shadowRoot?.querySelector("button");

    innerButton?.dispatchEvent(
      new MouseEvent("click", {
        bubbles: true,
        composed: true,
        cancelable: true,
      })
    );
  },
  true
);

async function runCopVerification() {
  try {
    const response = await fetch("/api/cop", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: document
          .querySelector('[data-name="NameOnBankAccount"]')
          .getAttribute("data-value"),
        sortCode: document
          .querySelector('[data-name="BankSortCode"]')
          .getAttribute("data-value"),
        accountNumber: document
          .querySelector('[data-name="BankAccountNumber"]')
          .getAttribute("data-value"),
        type: document
          .querySelector('[data-name="AccountType"]')
          .getAttribute("data-value"),
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Server returned ${response.status}: ${errText}`);
    }

    const data = await response.json();
    return data;
  } catch (err) {
    console.error("CoP verification error:", err);
  }
}
