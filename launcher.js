export default {
    frame: null,

    //--- Required parameters
    launchUrl: null,
    key: null,
    secret: null,
    
    //--- Optional parameters
    userId: null,
    
    outcomeService: {
        url: null,
        sourcedId: null
    },
    
    userInfo: {
        email: null,
        firstName: null,
        lastName: null,
        displayName: null,
        language: null
    },

    setup(iframeSelector, launchUrl, key, secret, userId) {
        this.frame = document.querySelector(iframeSelector)

        if(!this.frame) {
            throw "Frame not found";
        }

        this.launchUrl = launchUrl;
        this.key = key;
        this.secret = secret;
        this.userId = userId;

        if(!this.launchUrl || !this.key || !this.secret || !this.userId) {
            throw "The launch URL, key, secret and userId are required";
        }

        return this;
    },

    withUserInfo(firstName, lastName, displayName, email)
    {
        this.userInfo.firstName = firstName;
        this.userInfo.lastName = lastName;
        this.userIndo.displayName = displayName;
        this.userInfo.email = email;

        return this;
    },

    withLanguage(language) 
    {
        this.userInfo.language = language;

        if(!this.userInfo.language || this.userInfo.language == "")
        {
            console.warn("The language is empty");
        }

        return this;
    },

    withResultCallback(callbackUrl, callbackId) {
        this.outcomeService.url = callbackUrl;
        this.outcomeService.sourcedId = callbackId;

        if(!this.outcomeService.url || this.outcomeService.url == "") {
            throw "The outcome service URL cannot be empty";
        }

        if(!this.outcomeService.sourcedId || this.outcomeService.sourcedId == "") {
            throw "The sourcedId cannot be empty";
        }

        return this;
    },

    launch() {
        this.frame.name = this.frame.name || `lti-launch-frame-${this.generateTimestamp()}`;

        let form = document.createElement("form");
        form.target = this.frame.name;
        form.action = this.launchUrl;
        form.method = "POST";

        form.style.display = "none";

        this.inputs = [
           { key: "lti_message_type", value: "basic-lti-launch-request" },
           { key: "oauth_consumer_key", value: this.key },
           { key: "oauth_version", value: "1.0" },
           { key: "oauth_timestamp", value: this.generateTimestamp() },
           { key: "oauth_nonce", value: this.generateNonce() },
           { key: "oauth_signature_method", value: "HMAC-SHA1" },
           { key: "lti_version", value: "LTI-1p0" }
        ];

        if(this.userId) {
            this.inputs.push({ key: "user_id", value: this.userId });
        }

        if(this.outcomeService.url && this.outcomeService.sourcedId)
        {
            this.inputs.push({ key: "lis_outcome_service_url", value: this.outcomeService.url });
            this.inputs.push({ key: "lis_result_sourcedid", value: this.outcomeService.sourcedId });
        };

        if(this.userInfo.firstName) {
            this.inputs.push({ key: "lis_person_name_given", value: this.userInfo.firstName });
        }

        if(this.userInfo.lastName) {
            this.inputs.push({ key: "lis_person_name_family", value: this.userInfo.lastName });
        }

        if(this.userInfo.displayName) {
            this.inputs.push({ key: "lis_person_name_full", value: this.userInfo.displayName });
        }

        if(this.userInfo.email) {
            this.inputs.push({ key: "lis_person_contact_email_primary", value: this.userInfo.email });
        }

        if(this.userInfo.language) {
            this.inputs.push({ key: "launch_presentation_locale", value: this.userInfo.language });
        }

        this.inputs.sort((a, b) => {
            return a.key.localeCompare(b.key);
        });

        this.inputs.forEach(input => {
            form.appendChild(this.createInput(input.key, input.value));
        });

        document.body.appendChild(form);

        let signature = this.getSignature();

        this.generateHMACSHA512(signature, this.secret)
            .then(hashedSignature => {
                form.appendChild(this.createInput("oauth_signature", hashedSignature));
                form.submit();
                form.parentElement.removeChild(form);
            });
    },

    createInput(name, value) {
        let input = document.createElement('input');
        input.name = name;
        input.value = value;
        return input;
    },

    generateTimestamp() {
        let now = new Date();
        return String(now.getTime()).substring(0, 10);
    },

    generateNonce() {
        return Math.floor(Math.random() * (9999999 - 123400 + 1) + 123400);
    },

    getSignature() {
        let signature = "POST&" + encodeURIComponent(this.launchUrl) + "&";
        
        // Build the signature string by combining the dictionary together
        this.inputs.forEach(function (input) {
            signature += encodeURIComponent(input.key + "=" + encodeURIComponent(input.value) + "&");
        })

        // Remove the trailing "&" (this is URL encoded, so the & is 3 chars long)
        signature = signature.substring(0, signature.length - 3);

        return signature;
    },

    async generateHMACSHA512(message, key) {
        key = encodeURIComponent(key) + "&";

        const g = str => new Uint8Array([...unescape(encodeURIComponent(str))].map(c => c.charCodeAt(0))),
        k = g(key),
        m = g(message),
        c = await crypto.subtle.importKey('raw', k, { name: 'HMAC', hash: 'SHA-256' },true, ['sign']),
        s = await crypto.subtle.sign('HMAC', c, m);
        return btoa(String.fromCharCode(...new Uint8Array(s)))
    }
}