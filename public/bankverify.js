/* 
We need to add text with a checkbox to the process to confirm the customer is the account holder and the payer. If not they cannot proceed and copy must be made available for printing.
For confirm the person is the only person required to authorise debit from the account.  If they say No, then we need to stop the process and provide a mechanism to send them the mandate to complete (email to them or provide link for them to download).  
We need to add text with a checkbox to confirm the bank details (bank details shown to customer and they tick to agree they are correct / or just a text box to agree that details previously provided are correct).
Optional - show the notice period
Optional - advise company name that will appear against the DD.
Where the customer downloads the data they entered. We need to change this from using a mandate to be a confirmation letter

*/

/* 
• This Guarantee is offered by all banks and building societies that accept instructions to pay Direct Debits  

• If there are any changes to the amount, date or frequency of your Direct Debit BOOKER LTD T/A BOOKER CASH&CARRY will notify you 3 working days in advance of your account being debited or as otherwise agreed. If you request BOOKER LTD T/A BOOKER CASH&CARRY to collect a payment, confirmation of the amount and date will be given to you at the time of the request  

• If an error is made in the payment of your Direct Debit, by BOOKER LTD T/A BOOKER CASH&CARRY or your bank or building society, you are entitled to a full and immediate refund of the amount paid from your bank or building society  

– If you receive a refund you are not entitled to, you must pay it back when BOOKER LTD T/A BOOKER CASH&CARRY asks you to.

• You can cancel a Direct Debit at any time by simply contacting your bank or building society. Written confirmation may be required. Please also notify us. 
*/


/* 
Paperless DD

Council customers - no need for Direct Debits as they do not need to submit Bank Details for credit application or credit increase.  Correct, Government funded bodies are allowed to pay by bacs after registering for this method (manual process)

 

For all other customer types:

 

Customer with KYC pack < 2 years old with an active DD (SAP sends KYC=Y and DD=Y) - customer apply for credit increase and see Docusign document without DDI and without Direct Debit Guarantee – Yes and a credit check is to be performed to substantiate increase.
Customer with KYC pack < 2 years old without an active DD (SAP sends KYC=Y and DD=N) - customer not allowed to apply for credit increase because they do not have a DD mandate, therefore no Docusign document – He can apply for credit but has to go through completing the paperwork including DD
Customer with KYC pack > 2 years old with an active DD (SAP sends KYC=N and DD=Y)  - customer apply for credit via the full credit application journey and they see Docusign document without the DDI and with the Direct Debit Guarantee - yes
Customer with KYC pack > 2 years old without an active DD (SAP sends KYC=N and DD=N)  - customer apply for credit via the full credit application journey and they see Docusign document with the DDI and with the Direct Debit Guarantee
 

 

KYC

Customer with KYC pack < 2 years old with an active DD - we do the consumer and company checks, and no bank check because they already have an active DD.

 

 

 

Please confirm we are all aligned on the above.

 

 

And also a question on the scenario Customer with KYC pack > 2 years old with an active DD (SAP sends KYC=N and DD=Y) - customer apply for credit via the full credit application journey – do we need to remove the Bank Details section in the KYC form so customers cannot submit another set of bank details?  I would say yes, as the process of cancelling and adding a bank has to be carefully managed
*/


window.__currentNextClick = null;
window.__copAutoAdvance = false;
window.__copResumeInProgress = false;

const bankSectionNextButton = document.getElementById("bankSectionNextButton");
const sections = [...document.getElementsByTagName("accordion-tab")];
const confirmAccountHolder = document.getElementById("confirmAccountHolder");
const inputs = [...document.getElementsByTagName("kyc-input")];


const companyName = inputs.find(
  (i) => i.getAttribute("data-name") === "CompanyName"
);

const businessName = inputs.find(
  (i) => i.getAttribute("data-name") === "BusinessName"
);

const proprietorFirstName = inputs.find(
  (i) => i.getAttribute("data-name") === "firstName" 
);

const proprietorSurname = inputs.find(
  (i) => i.getAttribute("data-name") === "surname" 
);

const tradingStyle = inputs.find((i) => i.getAttribute("data-name") === "TradingStyle");

const chosenTradingStyle = tradingStyle.shadowRoot;

chosenTradingStyle.addEventListener('change', () => {
  const chosen = tradingStyle.getAttribute("data-value");
  const directDebitName = document.getElementById("directDebitName");
  directDebitName.innerHTML = (chosen === "Sole Trader / Partnership") ? proprietorFirstName.getAttribute("data-value") + " " + proprietorSurname.getAttribute("data-value") : companyName.getAttribute("data-value");
});

const bankSection = sections.find(
  (s) => s.getAttribute("data-title") === "Bank Details"
);

const businessTradingSection = sections.find(
  (s) => s.getAttribute("data-title") === "Business / Trading Information"
);

const guarantorCheckbox = inputs.find(
  (i) => i.getAttribute("data-name") === "guarantorsCheckbox"
);


const docWithGuarantor = "/Credit-Agreement-EMBEDDED-No-Visable-Fields-V5-withDDI-withguarantee-withguarantor.pdf"; 
const docNoGuarantor = "/Credit-Agreement-EMBEDDED-No-Visable-Fields-V5-withDDI-withguarantee-noguarantor.pdf";
const increaseWithGuarantor = "/Credit-Agreement-EMBEDDED-No-Visable-Fields-V5-credit-increase-withDDI-withguarantee-withguarantor.pdf";
const increaseNoGuarantor = "/Credit-Agreement-EMBEDDED-No-Visable-Fields-V5-credit-increase-withDDI-withguarantee-noguarantor.pdf";

const filename = window.location.pathname.split("/").pop();

//document.getElementById("confirmAccountHolderUrl").href = "/Credit-Agreement-EMBEDDED-No-Visable-Fields-V5-withDDI-withguarantee-noguarantor.pdf";


    const guarantorInput = guarantorCheckbox.shadowRoot;
    guarantorInput.addEventListener('click', () => {
      let isGuarantorChecked = guarantorInput.querySelector('input').checked;
      if (filename.includes("creditincrease")) {
        document.getElementById("confirmAccountHolderUrl").href = (isGuarantorChecked) ? increaseWithGuarantor : increaseNoGuarantor;
      }
      else {
        document.getElementById("confirmAccountHolderUrl").href = (isGuarantorChecked) ? docWithGuarantor : docNoGuarantor;
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
