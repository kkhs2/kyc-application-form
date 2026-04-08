/* VDD email address disable input */
    const inputs = [...document.getElementsByTagName("kyc-input")];
    const email = inputs.find(
        (i) => i.getAttribute("data-name") === "VDDEmailAddress"
    );

    if (email) {
        const emailInput = email.shadowRoot;
        emailInput.querySelector('input').disabled = true;
    }
    