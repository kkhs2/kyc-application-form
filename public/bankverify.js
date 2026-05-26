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

const attributeFinder = (type, attr, value) => {
  const val = type.find((v) => v.getAttribute(attr) === value);
  return val !== undefined ? val : null;
};

const accordions = document.getElementsByTagName("kyc-input");

const bankSectionNextButton = document.getElementById("bankSectionNextButton");
const sections = [...document.getElementsByTagName("accordion-tab")];

const confirmAccountHolder = document.getElementById("confirmAccountHolder");
const inputs = [...document.getElementsByTagName("kyc-input")];
const notes = [...document.getElementsByTagName("kyc-note")];
let chosenTradingStyleValue = "";
let confirmAccountHolderUrl = document.getElementById(
  "confirmAccountHolderUrl",
);
const creditRequirementsSection = sections.filter(
  (section) => section.getAttribute("data-title") === "Credit Requirements",
);

const nextButtons = [...document.getElementsByTagName("next-button")];

const creditLimit = document.getElementById("CreditLimitLabel")
  ? document.getElementById("CreditLimitLabel").value
  : null;

const path = window.location.pathname.split("/").pop();

const isIncrease = document.getElementById("IsIncrease")
  ? document.getElementById("IsIncrease").value.toLowerCase()
  : false;
const isIncreaseHiddenField = attributeFinder(
  inputs,
  "data-name",
  "isIncrease",
);
isIncreaseHiddenField.classList.add("d-none");
const isIncreaseHiddenFieldValue = isIncreaseHiddenField.setAttribute(
  "data-value",
  isIncrease,
);

const urlParams = new URLSearchParams(document.location.search);
const hasExistingDd = urlParams.get("hasExistingDD")
  ? urlParams.get("hasExistingDD")
  : document.getElementById("HasExistingDD")
    ? document.getElementById("HasExistingDD").value.toLowerCase()
    : false;

const hasExistingDdHiddenField = attributeFinder(
  inputs,
  "data-name",
  "hasExistingDD",
);
hasExistingDdHiddenField.classList.add("d-none");
const hasExistingDdHiddenFieldValue = hasExistingDdHiddenField.setAttribute(
  "data-value",
  hasExistingDd,
);

let creditLimitRequiredError = attributeFinder(
  notes,
  "data-name",
  "CreditLimitRequiredError",
);

if (sections.length > 0) {
  sections.forEach((section) => {
    const shadow = section.shadowRoot;
    const tabs = shadow.querySelectorAll(".accordion-tab.accordion-tab-title");

    tabs.forEach((tab) => {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          const el = mutation.target;

          if (el.classList.contains("active")) {
            // scroll to top of active section
            window.scrollTo({
              top: 0,
              behavior: "smooth",
            });
          }
        });
      });

      observer.observe(tab, {
        attributes: true,
        attributeFilter: ["class"],
      });
    });
  });
}

if (hasExistingDd === "true") {
  const emailAddress = attributeFinder(inputs, "data-name", "EmailAddress");
  const confirmEmailAddress = attributeFinder(
    inputs,
    "data-name",
    "ConfirmEmailAddress",
  );
  emailAddress.shadowRoot.querySelector("input").disabled =
    emailAddress !== null ? true : false;
  confirmEmailAddress.shadowRoot.querySelector("input").disabled =
    confirmEmailAddress !== null ? true : false;
}

if (isIncrease === "true") {
  creditLimitRequiredError.classList.add("d-none");

  if (creditLimit !== null) {
    const creditLimitValue = parseInt(creditLimit.replace(/[£|\,]/g, ""));
    const requestedCredit = attributeFinder(
      inputs,
      "data-name",
      "CreditLimitRequired",
    );
    const requestedCreditInput =
      requestedCredit.shadowRoot.querySelector("input");
    const originalSubmit = HTMLFormElement.prototype.submit;

    requestedCreditInput.addEventListener("change", (event) => {
      const requestedCreditValue = event.target.value;
      HTMLFormElement.prototype.submit = function () {
        if (this.id === "kyc-application-form") {
          if (requestedCreditValue < creditLimitValue) {
            creditLimitRequiredError.classList.remove("d-none");
            creditLimitRequiredError.setAttribute(
              "data-content",
              `You have requested for a credit increase amount which is lower than your current credit limit. To submit your request please enter a credit increase amount higher than £${creditLimitValue}.`,
            );
            console.log("Increase amount is smaller than current limit");
            return;
          }
          return originalSubmit.apply(this, arguments);
        }
      };
    });
  }
}

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

const removeBankDetailsIfActiveDirectDebit = () => {
  if (hasExistingDd === "true") {
    bankSection.remove();
    creditRequirementsSection[0].setAttribute("data-index", 2);
    creditRequirementsSection[0]
      .getElementsByTagName("tab-content")[0]
      .setAttribute("data-index", 2);
  }
};

let bottomlineDidYouMean = attributeFinder(
  notes,
  "data-name",
  "BottomlineDidYouMean",
);

let bottomlineReason = attributeFinder(inputs, "data-name", "BottomlineReason");

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

bottomlineName.classList.add("d-none");
bottomlineReasonCode.classList.add("d-none");
bottomlineReason.classList.add("d-none");
bottomlineOriginalName.classList.add("d-none");
bottomlineTimestamp.classList.add("d-none");

const tradingStyle = attributeFinder(inputs, "data-name", "TradingStyle");

const chosenTradingStyle = tradingStyle.shadowRoot;

chosenTradingStyle.addEventListener("change", () => {
  chosenTradingStyleValue = tradingStyle.getAttribute("data-value");
  removeBankDetailsIfActiveDirectDebit();
});

const bankSection = attributeFinder(sections, "data-title", "Bank Details");

const bankKycNote = [...bankSection.getElementsByTagName("kyc-note")];
bankKycNote.map((note) => note.classList.add("d-none"));

const guarantorCheckbox = attributeFinder(
  inputs,
  "data-name",
  "guarantorsCheckbox",
);

const guarantorInput = guarantorCheckbox.shadowRoot;

chosenTradingStyle.addEventListener("change", () => {
  chosenTradingStyleValue = tradingStyle.getAttribute("data-value");
  if (
    chosenTradingStyleValue === "Ltd Company" &&
    confirmAccountHolderUrl !== null &&
    guarantorInput.querySelector("input").checked
  ) {
    confirmAccountHolderUrl.href =
      isIncrease === "true" ? increaseWithGuarantor : docWithGuarantor;
  } else {
    confirmAccountHolderUrl.href =
      isIncrease === "true" ? increaseNoGuarantor : docNoGuarantor;
  }
});

guarantorInput.addEventListener("change", () => {
  let isGuarantorChecked = guarantorInput.querySelector("input").checked;
  if (
    isGuarantorChecked &&
    tradingStyle.getAttribute("data-value") === "Ltd Company" &&
    confirmAccountHolderUrl !== null
  ) {
    confirmAccountHolderUrl.href =
      isIncrease === true ? increaseWithGuarantor : docWithGuarantor;
  } else {
    confirmAccountHolderUrl.href =
      isIncrease === true ? increaseNoGuarantor : docNoGuarantor;
  }
});

const bankVerificationErrorContainer = document.getElementById(
  "bankVerificationErrorContainer",
);
bankVerificationErrorContainer.classList.add("d-none");

const submitButtonComponent = document.querySelector("next-button[is-submit]");

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
  bankSectionNextButton.classList.toggle("d-none");
};

toggleBankDetailsContent();

confirmAccountHolder.addEventListener("change", () => {
  // function to unhide the entire Bank Details section
  toggleBankDetailsContent();
  const bankKycNote = [...bankSection.getElementsByTagName("kyc-note")];
  bankKycNote.map((note) =>
    note.getAttribute("data-name") === "NameOnAccountNote" &&
    confirmAccountHolder.checked
      ? note.classList.remove("d-none")
      : note.classList.add("d-none"),
  );
});

if (hasExistingDd === "false") {
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

      bottomlineName.setAttribute("data-value", bankVerify.name);
      bottomlineReasonCode.setAttribute("data-value", bankVerify.reasonCode);
      bottomlineReason.setAttribute("data-value", bankVerify.reason);
      bottomlineOriginalName.setAttribute(
        "data-value",
        bankVerify.originalName,
      );
      bottomlineTimestamp.setAttribute("data-value", new Date().toISOString());

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
}
