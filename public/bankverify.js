window.__currentNextClick = null;
window.__copAutoAdvance = false;
window.__copResumeInProgress = false;

const bankSectionNextButton = document.getElementById("bankSectionNextButton");
const sections = [...document.getElementsByTagName("accordion-tab")];
const confirmAccountHolder = document.getElementById("confirmAccountHolder");
const inputs = [...document.getElementsByTagName("kyc-input")];
let chosenTradingStyleValue = "";

const tradingStyle = inputs.find(
  (i) => i.getAttribute("data-name") === "TradingStyle",
);

const chosenTradingStyle = tradingStyle.shadowRoot;

chosenTradingStyle.addEventListener("change", () => {
  chosenTradingStyleValue = tradingStyle.getAttribute("data-value");
});


const directDebitName = document.getElementById("directDebitName");

const nameOnAccount = inputs.find(
  (i) => i.getAttribute("data-name") === "NameOnBankAccount",
);

const nameOnBankAccount = nameOnAccount.shadowRoot;

nameOnBankAccount.addEventListener("input", (e) => {
  directDebitName.innerHTML = e.target.value;
});

const bankSection = sections.find(
  (s) => s.getAttribute("data-title") === "Bank Details",
);

const businessTradingSection = sections.find(
  (s) => s.getAttribute("data-title") === "Business / Trading Information",
);

const guarantorCheckbox = inputs.find(
  (i) => i.getAttribute("data-name") === "guarantorsCheckbox",
);

const docWithGuarantor =
  "https://www.booker.co.uk/~/media/Files/KYC/Credit-Agreement-EMBEDDED-No-Visable-Fields-V5-withDDI-withguarantee-withguarantor";
const docNoGuarantor =
  "https://www.booker.co.uk/~/media/Files/KYC/Credit-Agreement-EMBEDDED-No-Visable-Fields-V5-withDDI-withguarantee-noguarantor";
const increaseWithGuarantor =
  "https://www.booker.co.uk/~/media/Files/KYC/Credit-Agreement-EMBEDDED-No-Visable-Fields-V5-credit-increase-withDDI-withguarantee-withguarantor";
const increaseNoGuarantor =
  "https://www.booker.co.uk/~/media/Files/KYC/Credit-Agreement-EMBEDDED-No-Visable-Fields-V5-credit-increase-withDDI-withguarantee-noguarantor";

const guarantorInput = guarantorCheckbox.shadowRoot;
const filename = window.location.pathname.split("/").pop();


chosenTradingStyle.addEventListener("change", () => {
  chosenTradingStyleValue = tradingStyle.getAttribute("data-value");
  if (chosenTradingStyleValue === "Ltd Company" && guarantorInput.querySelector("input").checked) {
    document.getElementById("confirmAccountHolderUrl").href = (filename.includes("creditincrease")) ? increaseWithGuarantor : docWithGuarantor; 
  } else {
    document.getElementById("confirmAccountHolderUrl").href = (filename.includes("creditincrease")) ? increaseNoGuarantor : docNoGuarantor;
  }
});


guarantorInput.addEventListener("change", () => {
  let isGuarantorChecked = guarantorInput.querySelector("input").checked;
  if (isGuarantorChecked && tradingStyle.getAttribute("data-value") === "Ltd Company") {
      document.getElementById("confirmAccountHolderUrl").href = (filename.includes("creditincrease")) ? increaseWithGuarantor : docWithGuarantor;
   
  } else {
    document.getElementById("confirmAccountHolderUrl").href = (filename.includes("creditincrease")) ? increaseNoGuarantor : docNoGuarantor;
  }
});

const bankVerificationErrorContainer = document.getElementById(
  "bankVerificationErrorContainer",
);
bankVerificationErrorContainer.classList.add("d-none");

const nextButtons = [...document.getElementsByTagName("next-button")];

const toggleBankDetailsContent = () => {
  const bankWhiteContainers = [
    ...bankSection.getElementsByTagName("white-container"),
  ];
  bankWhiteContainers.map((container) => {
    if (
      container.id !== "confirmAccountHolderPayer" &&
      container.id !== "bankVerificationErrorContainer"
    ) {
      container.classList.toggle("d-none");
    }
  });
  const bankKycInputs = [...bankSection.getElementsByTagName("kyc-input")];
  bankKycInputs.map((input) => {
    if (input.id !== "confirmAccountHolder") {
      input.classList.toggle("d-none");
    }
  });
  const bankKycNote = [...bankSection.getElementsByTagName("kyc-note")];
  bankKycNote.map((note) => note.classList.toggle("d-none"));
  bankSectionNextButton.classList.toggle("d-none");
};

toggleBankDetailsContent();

confirmAccountHolder.addEventListener("click", () => {
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
      const bankTab = document.querySelector(
        'accordion-tab[data-title="Bank Details"]',
      );
      const errorFields = [...bankTab?.querySelectorAll("kyc-input")];
      const firstErrorField = errorFields.find(
        (el) => el.getAttribute("data-error") === "true",
      );
      firstErrorField?.scrollIntoView(
        {
          behavior: "smooth",
          block: "start",
        },
        800,
      );
      return;
    }

    const bankVerify = await runCopVerification();

    if (bankVerify?.match !== true) {
      console.log("Bank step: CoP verification failed");
      bankVerificationErrorContainer.classList.remove("d-none");
      const bankTab = document.querySelector(
        'accordion-tab[data-title="Bank Details"]',
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
      }),
    );
  },
  true,
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
