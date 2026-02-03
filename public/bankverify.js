window.__currentNextClick = null;
window.__copAutoAdvance = false;
window.__copResumeInProgress = false;

const bankSectionNextButton = document.getElementById("bankSectionNextButton");
const sections = [...document.getElementsByTagName("accordion-tab")];
const bankSection = sections.find(
  (s) => s.getAttribute("data-title") == "Bank Details"
);
const bankVerificationErrorContainer = document.getElementById(
  "bankVerificationErrorContainer"
);
bankVerificationErrorContainer.classList.add("d-none");

const nextButtons = [...document.getElementsByTagName("next-button")];

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
