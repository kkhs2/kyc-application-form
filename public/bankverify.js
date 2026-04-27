const docWithGuarantor =
  "https://www.booker.co.uk/~/media/Files/KYC/Credit-Agreement-EMBEDDED-No-Visable-Fields-V5-withDDI-withguarantee-withguarantor";
const docNoGuarantor =
  "https://www.booker.co.uk/~/media/Files/KYC/Credit-Agreement-EMBEDDED-No-Visable-Fields-V5-withDDI-withguarantee-noguarantor";
const increaseWithGuarantor =
  "https://www.booker.co.uk/~/media/Files/KYC/Credit-Agreement-EMBEDDED-No-Visable-Fields-V5-credit-increase-withDDI-withguarantee-withguarantor";
const increaseNoGuarantor =
  "https://www.booker.co.uk/~/media/Files/KYC/Credit-Agreement-EMBEDDED-No-Visable-Fields-V5-credit-increase-withDDI-withguarantee-noguarantor";


window.__currentNextClick = null;
window.__copAutoAdvance = false;
window.__copResumeInProgress = false;


const bankSectionNextButton = document.getElementById("bankSectionNextButton");
const sections = [...document.getElementsByTagName("accordion-tab")];
const confirmAccountHolder = document.getElementById("confirmAccountHolder");
const inputs = [...document.getElementsByTagName("kyc-input")];
const notes = [...document.getElementsByTagName("kyc-note")];
let chosenTradingStyleValue = "";
let confirmAccountHolderUrl = document.getElementById("confirmAccountHolderUrl");

const attributeFinder = (type, attr, value) => {
  const val = type.find(v => v.getAttribute(attr) === value);
  return (val !== undefined) ? val : null;
};

let bottomlineDidYouMean = attributeFinder(
  notes,
  "data-name",
  "BottomlineDidYouMean",
);



const tradingStyle = attributeFinder(inputs, "data-name", "TradingStyle");

const chosenTradingStyle = tradingStyle.shadowRoot;

chosenTradingStyle.addEventListener("change", () => {
  chosenTradingStyleValue = tradingStyle.getAttribute("data-value");
});

const bankSection = attributeFinder(sections, "data-title", "Bank Details");
const bankKycNote = [...bankSection.getElementsByTagName("kyc-note")];
bankKycNote.map(note => note.classList.add("d-none"));

const guarantorCheckbox = attributeFinder(
  inputs,
  "data-name",
  "guarantorsCheckbox",
);

const guarantorInput = guarantorCheckbox.shadowRoot;
const path = window.location.pathname.split("/").pop();

chosenTradingStyle.addEventListener("change", () => {
  chosenTradingStyleValue = tradingStyle.getAttribute("data-value");
  if (
    chosenTradingStyleValue === "Ltd Company" &&
    guarantorInput.querySelector("input").checked
  ) {
    confirmAccountHolderUrl.href = path.includes(
      "credit-increase",
    )
      ? increaseWithGuarantor
      : docWithGuarantor;
  } else {
    confirmAccountHolderUrl.href = path.includes(
      "credit-increase",
    )
      ? increaseNoGuarantor
      : docNoGuarantor;
  }
});

guarantorInput.addEventListener("change", () => {
  let isGuarantorChecked = guarantorInput.querySelector("input").checked;
  if (
    isGuarantorChecked &&
    tradingStyle.getAttribute("data-value") === "Ltd Company"
  ) {
    confirmAccountHolderUrl.href = path.includes(
      "credit-increase",
    )
      ? increaseWithGuarantor
      : docWithGuarantor;
  } else {
    confirmAccountHolderUrl.href = path.includes(
      "credit-increase",
    )
      ? increaseNoGuarantor
      : docNoGuarantor;
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

  bankWhiteContainers.map(container => {
    if (
      container.id !== "confirmAccountHolderPayer" &&
      container.id !== "bankVerificationErrorContainer"
    ) {
      container.classList.toggle("d-none");
    }
  });
  const bankKycInputs = [...bankSection.getElementsByTagName("kyc-input")];
  bankKycInputs.map(input => {
    if (input.id !== "confirmAccountHolder") {
      input.classList.toggle("d-none");
    }
  });
  bankSectionNextButton.classList.toggle("d-none");
};

toggleBankDetailsContent();

confirmAccountHolder.addEventListener("change", () => {
  // function to unhide the entire Bank Details section
  toggleBankDetailsContent();
  const bankKycNote = [...bankSection.getElementsByTagName("kyc-note")];
  bankKycNote.map(note => (note.getAttribute("data-name") === "NameOnAccountNote" && confirmAccountHolder.checked) ? 
      note.classList.remove("d-none") : note.classList.add("d-none") 
  );
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
    bottomlineDidYouMean.classList.add("d-none");
    const bankVerify = await runCopVerification();

    console.log(bankVerify);

    if (bankVerify?.match !== true) {
      console.log("Bank step: CoP verification failed");
      bankVerificationErrorContainer.classList.remove("d-none");
      if (bankVerify.name !== null) {
        bottomlineDidYouMean.setAttribute(
          "data-content",
          `Did you mean ${bankVerify.name}?`,
        );
        bottomlineDidYouMean.classList.remove("d-none");
      }
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

    let bottomlineReason = attributeFinder(
      inputs,
      "data-name",
      "BottomlineReason",
    );

    let bottomlineOriginalName = attributeFinder(
      inputs,
      "data-name",
      "BottomlineOriginalName",
    );

    let bottomlineName = attributeFinder(inputs, "data-name", "BottomlineName");

    let bottomlineReasonCode = attributeFinder(
      inputs,
      "data-name",
      "BottomlineReasonCode",
    );

    let bottomlineTimestamp = attributeFinder(
      inputs,
      "data-name",
      "BottomlineTimestamp",
    );

    bottomlineName.setAttribute("data-value", bankVerify.name);
    bottomlineReasonCode.setAttribute("data-value", bankVerify.reasonCode);
    bottomlineReason.setAttribute("data-value", bankVerify.reason);
    bottomlineOriginalName.setAttribute("data-value", bankVerify.originalName);
    bottomlineTimestamp.setAttribute("data-value", new Date().toISOString());

    bottomlineName.classList.add("d-none");
    bottomlineReasonCode.classList.add("d-none");
    bottomlineReason.classList.add("d-none");
    bottomlineOriginalName.classList.add("d-none");
    bottomlineTimestamp.classList.add("d-none");

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
