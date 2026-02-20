import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { API_DEFAULT_LANGUAGE } from './constants/apiConstants';

const resources = {
    en: {
        translation: {
            login: "Login",
            logout: "Logout",
            myProfile: "My Profile",
            stlViewer: "3D Viewer",
            manageUsers: "Manage Users",
            manageDomains: "Manage Domains",
            manageRoles: "Manage Roles",
            settings: "Settings",
            welcome: "Welcome",
            videoPhoto: "Video/Photo",
            chat: "Chat",
            revenueReport: "Revenues",
            timesheet: "Timesheet",
            unauthorized: "You're unauthorized!",

            /*Timesheet's translations*/
            timesheetNameLabel: "Timesheet name",
            timesheetNamePlaceholder: "Enter timesheet name",

            //emplyee
            employeeLabel: "Employee",
            employeePlaceholder: "Enter your name",

            //job
            jobTitleLabel: "Job title",
            jobTitlePlaceholder: "Enter job title",

            //project
            projectLabel: "Cost center / Project",
            projectPlaceholder: "Enter cost center or project",

            //date and time
            dateLabel: "Date",
            startTimeLabel: "Start time",
            endTimeLabel: "End time",

            //normal hours
            normalHoursLabel: "Normal hours",
            normalHoursPlaceholder: "Enter hours worked",

            //extra hours
            extrasLaLabel: "Extras Sat",
            extrasSuLabel: "Extras Sun",
            extrasEveningLabel: "Extras Evening",
            extrasNightLabel: "Extras Night",
            extrasPlaceholder: "Enter hours if any",
            showExtrasPlaceholder: "Fill in",

            //overtime hours
            overtimeVrk50Label: "Overtime day 50%",
            overtimeVrk100Label: "Overtime day 100%",
            overtimeVko50Label: "Overtime week 50%",
            overtimeVko100Label: "Overtime week 100%",
            overtimePlaceholder: "Enter hours if any",
            showOvertimePlaceholder: "Fill in",

            //compensations
            atvLabel: "ATV (holiday hours)",
            travelLabel: "Travel hours",
            mealLabel: "Meal compensation",

            toolCompLabel: "Tool compensation",
            toolCompPlaceholder: "Enter euros",

            //daily allowance
            dailyAllowance: "Daily allowance",
            none: "No",
            partial: "Partial",
            full: "Full",

            //km
            kmLabel: "Mileage",
            kmPlaceholder: "Enter kilometers",
            kmNoteLabel: "Mileage note",
            kmNotePlaceholder: "Purpose of travel (e.g., meeting)",
            kmDescInfo: "Fill in",

            //notes and memo
            noteLabel: "Notes",
            notePlaceholder: "Short note, e.g., delay or special situation",

            memoLabel: "MEMO",
            memoPlaceholder: "Write detailed description or memo here",

            //buttons
            toggleExtrasShow: "Show extras",
            toggleExtrasHide: "Hide extras",

            toggleOvertimeShow: "Show overtime",
            toggleOvertimeHide: "Hide overtime",

            addRowButton: "➕ Add row",
            clearAllButton: "🗑 Clear all",

            //validators and messages
            messageTooBig: "This number is too large",
            messageTooSmall: "This number is too small",

            requiredField: "This field is required",

            successSendForm: "Row added successfully",
            errorSendForm: "Failed to add row",

            successClearForm: "All data cleared",
            errorClearForm: "Failed to clear data",
            emptyClearForm: "Nothing to clear because the form is empty",

            timeValidationMessage: "Start time cannot be later than end time",

            //summary
            summaryHeader: "Summary",
            //Audio Recorder
            ask_from_ai: "Ask from AI",
            waveform: "Waveform",
            volume: "Volume Level Meter",
            male: "Male",
            female: "Female",
            generate_image: "Generate Image",

            //Email verification
            emailVerification: "Email Verification",
            goToLogin: "Go to Login?",
            loginHere: "Login here",

            // File upload form
            uploadStlFile: "Upload STL File",
            browse: "Browse...",
            upload: "Upload",
            chose: "You chose file:",
            press: "Press Upload to upload it.",

            cropImage: "Crop Image",
            delete: "Delete",

            //Login Form
            email: "Email address",
            enteremail: "Enter email",
            newershare: "We'll never share your email with anyone else.",
            password: "Password",
            submit: "Submit",
            account: "Don't have an account?",
            register: "Register",
            forgot: "or forgot a password?",
            reset: "Reset",
            error: "Unexpected error!",
            error_username_or_password: "Username and password are required",
            error_domain_is_expired: "Username and password do not match, or domain subscription is not valid or expired!",
            success_in_login: "Login successful. Redirecting to home page...",

            //Manage Users
            areYouSure: "Are you sure?",
            wantToChangeUserStatus: "Are you sure that you want to change this user status?",
            wantToVerifyUser: "Are you sure that you want to verify this user?",
            wantToActivateUser: "Are you sure that you want to activate this user?",
            yes: "Yes",
            no: "No",
            close: "Close",
            actions: "Actions",
            changePassword: "Change Password",
            changeRole: "Change Role",
            verifyUser: "Verify User",
            deactivateUser: "Deactivate User",
            activateUser: "Activate User",
            avatar: "Avatar",
            addUser: "Add",
            fullName: "Full name",
            gender: "Gender",
            role: "Role",
            columnName: "Name",
            columnVerified: "Verified",
            columnDomain: "Domain",
            columnStatus: "Status",
            columnActions: "Actions",
            nameRequired: "Name is required",
            invalidEmail: "Invalid email",
            emailRequired: "Email is required",
            passwordMin: "Password must be at least 8 characters",
            passwordRequired: "Password is required",
            passwordsMustMatch: "Passwords must match",
            confirmPasswordRequired: "Confirm password is required",
            notAssigned: "not assigned",

            //Manage domain
            actions: "Actions",
            extendTrial30Days: "Extend Trial 30 days",
            makePaidSubscription: "Make a Paid Subscription",
            downgradeToTrial: "Downgrade to Trial",
            extendTrialOneYear: "Extend Trial by One year",
            terminateDomain: "Terminate domain",
            domain: "Domain",
            validBeforeAt: "Valid Before At",
            type: "Type",
            company: "Company",
            vatId: "VAT-ID",
            phone: "Phone",
            email: "Email",
            country: "Country",
            edit: "Edit",
            paid: "Paid",
            trial: "Trial",
            previous: "Previous",
            next: "Next",

            //CHange password

            passwordChange: "Password Change",
            password: "Password",
            confirmPassword: "Confirm Password",
            change: "Change",
            close: "Close",

            //Manage domain form
            manageDomain: "Manage Domain",
            technicalContactEmail: "Technical Contact Email",
            billingContactEmail: "Billing Contact Email",
            mobileNumber: "Mobile Number",
            companyName: "Company Name",
            addressLine1: "Address Line 1",
            addressLine2: "Address Line 2",
            city: "City",
            country: "Country",
            zip: "Zip",
            vatId: "VAT-ID",
            save: "Save",
            invalidEmail: "Invalid email",
            required: "Required",
            mobileNumberStringError:
                "Mobile number should be in string with Country Code",

            //Manage roles
            add: "Add",
            numberSign: "#",
            name: "Name",
            noData: "No data",
            edit: "Edit",
            remove: "Remove",
            previous: "Previous",
            next: "Next",
            domain: "Domain",

            addRole: "Add Role",
            editRole: "Edit Role",
            roleName: "Role Name",
            permission: "Permission :",
            save: "Save",
            required: "Required",
            allDomains: "All domains",

            //my profile
            myDetails: "My Details",
            uploadImage: "Upload Image",
            removeImage: "Remove Image",
            cropImage: "Crop Image",
            capturePhoto: "Capture Photo",
            fullname: "Fullname",
            gender: "Gender",
            male: "Male",
            female: "Female",
            save: "Save",
            saving: "Saving...",
            nameRequired: "Name is required",
            genderRequired: "Gender is required",
            loading: "Loading...",
            saved: "Your profile details have been saved successfully.",
            //publichome
            video:
                "To view this video please enable JavaScript, and consider upgrading to a",
            web: "web browser that",
            support: "supports HTML5 video",
            copyright:
                "| i4ware - SDK | Copyright © i4ware Software 2004-2024, all rights reserved. | Version 1.0.0",

            //Messagelist
            your_browser_not_support_video_tag:
                "Your browser does not support the video tag.",
            generateSpeech: "Generate Speech",
            stopSpeech: "Stop Speech",

            //PusherChat
            send: "Send",
            typing: "is typing...",
            box: "Write a message...",
            browse: "Browse",
            capturePhoto: "Take a Photo",
            upload_image_with_message: "Upload Image with Message",
            capture_image_with_message: "Capture Image with Message",
            capture_video_with_message: "Capture Video with Message",
            speech_to_text: "Speech to Text",
            ask_from_ai: "Ask from AI",
            close: "Close",
            enter_your_message: "Enter your message here...",
            start_video: "Start Video",
            stop_video: "Stop Video",
            upload: "Upload and send",
            duration: "Duration",
            upload_successful: "Upload Successful",
            image_upload_successful: "Image upload success",
            pdf_upload_successful: "PDF upload success",
            capture_successful: "Image capture success",
            video_capture_successful: "Video capture success",
            please_select_file: "Please select a file to upload",
            failed_to_upload_file: "Failed to upload file. Please try again.",
            your_browser_not_support_video_tag:
                "Your browser does not support the video tag.",
            aiTypingIndicator: "AI is thinking...",
            record_audio: "Record Audio",
            speech: "is recoding speech...",
            please_capture_image: "Please capture an image to upload",
            please_capture_video: "Please capture a video to upload",
            please_write_message: "Please write a message to send",
            generate_image: "Generate Image",
            // ROHTO engineering form fields
            rohto_role_label: "Role (who am I / who am I asking you to be?)",
            rohto_role_placeholder:
                "E.g. 'Act as an AI assistant' or 'I am a lawyer...'",
            rohto_problem_label: "Instructions (what are the instructions?)",
            rohto_problem_placeholder: "Describe your instructions or question",
            rohto_history_label: "Notes (what are your observations?)",
            rohto_history_placeholder:
                "Break the task into clear steps to clarify the answer",
            rohto_goal_label: "Goal (what do you want to achieve?)",
            rohto_goal_placeholder: "Describe what you hope as a result",
            rohto_expectation_label: "Relevance (what kind of answer do you expect?)",
            rohto_expectation_placeholder:
                "Specify what you want it to address and what to leave out",
            rohto_for_prompt: "My question is",
            rohto_disable: "Disable ROHTO",
            rohto_enable: "Enable ROHTO",
            upload_pdf: "Upload PDF",
            upload_failure: "Upload Failure",
            pdf_upload_failure: "Failed to upload PDF. Please try again.",

            //Error registration
            error: "Error messages",
            error_messages: "Here are the mistakes in your registration form:",
            email_error: "The email has already been taken.",
            email_error_valid: "The email is not valid.",
            domain_error: "The domain has already been taken.",
            domain_error_valid: "The domain is not valid.",
            close: "Close",
            end_message: "Please, correct the mistakes and try again.",

            //Registration Form
            email: "Email",
            enteremail: "Enter email",
            newershare: "We'll never share your email with anyone else.",
            password: "Password",
            male: "Male",
            female: "Female",
            account: "Already have an account?",
            register: "Register",
            confirmPassword: "Confirm Password",
            domain: "Domain",
            error: "Unexpected error!",
            gender: "Gender",
            name: "Name",
            company_name: "Company Name",
            neverShareCompany: "We'll never share your company name with anyone else.",
            success_registration: "Registration successful and verification email has been sent.",
            selectPrivacyPolicy: "Please Select Privacy Policy.",
            neverShareName: "We'll never share your name with anyone else.",
            neverShareGender: "We'll never share your gender with anyone else.",
            domainInUse: "You need to know right domain that is in use.",
            neverShareDomain: "We'll never share your domain with anyone else.",
            passwordStronglyCrypted: "Password is strongly encrypted and is secure in our database.",
            privacyPolicy: "Privacy Policy",
            dataProcessingAgreement: "Data Processing Agreement",
            agreedOn: "Agreed on",
            and: "and",
            required: "Required",
            register: "Register",
            loginHere: "Login here",
            tooLong: "Too Long!",
            tooShort: "Too Short!",
            invalidEmail: "Invalid email",
            invalidDomain: "Domain is invalid",
            passwordsDontMatch: "Password and Confirm password should be same.",
            vat_id: "VAT ID",
            neverShareVatId: "We'll never share your VAT ID with anyone else.",
            business_id: "Business ID",
            neverShareBusinessId: "We'll never share your Business ID with anyone else.",
            address_line_1: "Address Line 1",
            neverShareAddress: "We'll never share your address with anyone else.",
            address_line_2: "Address Line 2",
            city: "City",
            neverShareCity: "We'll never share your city with anyone else.",
            country: "Country",
            neverShareCountry: "We'll never share your country with anyone else.",
            zip: "ZIP",
            neverShareZip: "We'll never share your ZIP with anyone else.",
            mobile_no: "Phone Number",
            neverShareMobileNo: "We'll never share your phone number with anyone else.",

            //Reset password
            neverShareEmail: "We'll never share your email with anyone else.",
            submit: "Submit",
            noAccount: "Don't have an account?",
            register: "Register",
            orLogin: "or login?",
            login: "Login",
            email: "Email",
            passwordResetSuccess: "Password reset successful and verification email has been sent.",
            invalidEmail: "Invalid email",
            required: "Required",
            tooLong: "Too Long!",

            year: "Year",

            //Cumulative Charts
            title: "Cumulative Sales Chart",
            error: "Failed to fetch transactions. Please try again.",
            loading: "Loading...",
            name: "Cumulative Vendor Balance",

            //Customers
            customertitle: "Customers",
            customererror: "Failed to fetch transactions. Please try again.",
            loading: "Loading...",

            //income
            incometitle: "Monthly Income",
            loading: "Loading...",
            incomeerror: "Failed to fetch monthly income.",
            total: "Total",
            src_all: "All Sources",
            src_atlassian: "Atlassian Pty Ltd",
            src_kela: "Pension Insurance",
            src_hourly: "Hourly Rate Customers",
            src_grandparents: "Grandparents' Inheritance",

            //Transactions
            transationtitle: "Yearly Sales Transactions",
            transactionerror: "Failed to fetch transactions. Please try again.",
            loading: "Loading...",
            transactionname: "Vendor Balance",

            //Transactiontable
            transactiontabletitle: "Transactions with Bar Chart",
            transactiontableerror: "Failed to fetch transactions. Please try again.",
            loading: "Loading...",
            transactiontablename: "Vendor Amount",

            //Settings
            showCaptcha: "Show Captcha in Register Form",
            disableRegistration:
                "Disable registration from other domains than domain owner",
            settingUpdated: "Setting Updated successfully",
            disableLicenseDetails: "Disable Lisense Details",
            enableNetvisor: "Enable Netvisor",

            //ShowResetPassword
            invalidEmail: "Invalid email",
            required: "Required",
            tooLong: "Too Long!",
            tooShort: "Too Short!",
            passwordsDontMatch: "Password and Confirm password should be same.",
            passwordResetSuccessful: "Password reset successful.",
            neverShareEmail: "We'll never share your email with anyone else.",
            passwordStronglyEncrypted: "Password is strongly encrypted and is secure in our database.",
            submit: "Submit",
            noAccount: "Don't have an account?",
            register: "Register",
            orLogin: "or login?",
            login: "Login",
            newershare: "We'll never share your email with anyone else.",
            email: "Email",
            password: "Password",
            confirmPassword: "Confirm Password",

            //ModalDelete
            are_you_sure: "Are you sure?",
            are_you_sure_text_delete: "Are you sure to delete this STL model and and it's screenshot? This action canno_deletet be undone.",
            yes_delete: "Yes, delete it",
            no_delete: "No, cancel",
            are_you_sure_text_modalphoto: "Are you sure to delete this item? This action cannot be undone.",

            //STLViewer
            viewSTL: "View STL",
            modelViewerTitle: "3D Model Viewer",
            close: "Close",
            loading: "Loading...",
            delete: "Delete",
            isLoading: "Loading more items...",
            generateSpaceship: "Generate Spaceship",
            generateCyborg: "Generate Cyborg",
            generating: "Generating...",
            isGenerating: "Generating 3D Model & Screenshot...",
            generateCar: "Generate Sports Car",

            //VideoPhoto
            videoPhoto: "Video/Photo",
            uploadPhoto: "Upload Photo",
            capturePhoto: "Capture Photo",
            uploadVideo: "Upload Video",
            captureVideo: "Capture Video",
            uploadSuccess: "Upload Successful",
            imageUploadSuccess: "Image uploaded successfully!",
            videoUploadSuccess: "Video uploaded successfully!",
            uploadError: "Upload Error",
            imageTypeNotSupported: "Image type is not supported. Please upload a JPEG (jpg) or PNG (png) image.",
            videoSizeTooLarge: "Video size is too large. Please upload a video file less than 100 MB.",

            //WebCam
            capturePhoto: "Capture Photo",
            upload: "Upload",
            removeImage: "Remove Image",
            closeOverlay: "Close",

        }
    },
    fi: {
        translation: {
            login: "Kirjaudu sisään",
            logout: "Kirjaudu ulos",
            myProfile: "Oma profiili",
            stlViewer: "3D-katseluohjelma",
            manageUsers: "Käyttäjät",
            manageDomains: "Domainit",
            manageRoles: "Roolit",
            settings: "Asetukset",
            welcome: "Tervetuloa",
            videoPhoto: "Video/Kuva",
            chat: "Chatti",
            revenueReport: "Liikevaihdot",
            timesheet: "Tuntikortti",
            unauthorized: "Olet luvaton käyttäjä!",

            /*Timesheet's translations - finnish*/
            timesheetNameLabel: "Tuntikortin nimi",
            timesheetNamePlaceholder: "Syötä tuntikortin nimi",

            //emplyee
            employeeLabel: "Työntekijä",
            employeePlaceholder: "Syötä nimesi",

            //job
            jobTitleLabel: "Ammattinimike",
            jobTitlePlaceholder: "Syötä ammatti",

            //project
            projectLabel: "Kustannuspaikka ja/tai projekti",
            projectPlaceholder: "Syötä kustannuspaikka tai projekti",

            //date and time
            dateLabel: "PVM ",
            startTimeLabel: "Työajan alku",
            endTimeLabel: "Työajan loppu",

            //normal hours
            normalHoursLabel: "Norm. tunnit",
            normalHoursPlaceholder: "Syötä tehdyt työtunnit",

            //extras
            extrasLaLabel: "Lisät la",
            extrasSuLabel: "Lisät su",
            extrasEveningLabel: "Lisät ilta",
            extrasNightLabel: "Lisät yö",
            extrasPlaceholder: "Syötä tunteina, jos on",
            showExtrasPlaceholder: "Täytä",

            //overtimes
            overtimeVrk50Label: "Ylityö vrk 50%",
            overtimeVrk100Label: "Ylityö vrk 100%",
            overtimeVko50Label: "Ylityö vko 50%",
            overtimeVko100Label: "Ylityö vko 100%",
            overtimePlaceholder: "Syötä tunteina, jos on",
            showOvertimePlaceholder: "Täytä",

            //compensations
            atvLabel: "ATV (arkipyhätunnit)",
            travelLabel: "Matkatunnit",
            mealLabel: "Ateriakorvaus",

            toolCompLabel: "Työkalukorvaus",
            toolCompPlaceholder: "Syötä euroina",

            //daily allowance
            dailyAllowance: "Päiväraha",
            none: "Ei",
            partial: "Osittainen",
            full: "Koko",

            //kilometers
            kmLabel: "Kilometrikorvaus",
            kmPlaceholder: "Syötä kilometrit",
            kmNoteLabel: "Kilometrikorvauksen selite",
            kmNotePlaceholder: "Matkan tarkoitus (esim. työpalaveri)",
            kmDescInfo: "Täytä",

            //notes and memo
            noteLabel: "Huomioita",
            notePlaceholder: "Lyhyt huomio, esim. myöhästyminen tai erityisolosuhde",

            memoLabel: "MEMO",
            memoPlaceholder: "Kirjoita tarkempi selite tai muistiinpano tähän",

            //buttons
            toggleExtrasShow: "Lisät näkyviin",
            toggleExtrasHide: "Lisät piiloon",

            toggleOvertimeShow: "Ylityöt näkyviin",
            toggleOvertimeHide: "Ylityöt piiloon",

            addRowButton: "➕ Lisää rivi",
            clearAllButton: "🗑 Tyhjennä kaikki",

            //validations and messages
            messageTooBig: "Liian suuri luku",
            messageTooSmall: "Ei ole kelvollinen luku",

            requiredField: "Tämä kenttä on pakollinen",

            successSendForm: "Rivi lisätty onnistuneesti",
            errorSendForm: "Rivin lisääminen epäonnistui",

            successClearForm: "Kaikki tiedot tyhjennetty",
            errorClearForm: "Tyhjennys epäonnistui",
            emptyClearForm: "Nollaa ei voi tehdä, koska lomake on tyhjä",

            timeValidationMessage: "Alkuaika ei voi olla myöhempi kuin loppuaika",

            //summary
            summaryHeader: "Yhteenveto",
            //Audio recorder
            ask_from_ai: "Kysy tekoälyltä",
            waveform: "Ääniraita",
            volume: "Äänenvoimakkuusmittari",
            male: "Mies",
            female: "Nainen",
            generate_image: "Luo kuva",

            //Email verification
            emailVerification: "Sähköpostin varmistus",
            goToLogin: "Siirry kirjautumaan?",
            loginHere: "Kirjaudu tästä",

            // File Upload Form
            uploadStlFile: "Lataa STL-tiedosto",
            browse: "Selaa...",
            upload: "Lataa",
            chose: "Valitsit tiedoston:",
            press: "Paina Lataa tallentaaksesi sen.",

            cropImage: "Rajaa kuva",
            delete: "Poista",

            //Login form
            email: "Sähköpostiosoite",
            enteremail: "Syötä sähköpostiosoite",
            newershare: "Emme koskaan jaa sähköpostiosoitettasi muille.",
            password: "Salasana",
            submit: "Lähetä",
            account: "Onko sinulla tili?",
            register: "Rekisteröidy",
            forgot: "tai unohditko salasanan?",
            reset: "Palauta",
            error: "Odottamaton virhe!",
            error_username_or_password: "Käyttäjätunnus tai salasana on pakollinen",
            error_domain_is_expired: "Käyttäjätunnus ja salasana eivät täsmää tai domainin tilaus ei ole voimassa tai se on umpeutunut!",
            success_in_login: "Kirjautuminen onnistui. Ohjataan kotisivulle...",

            //Manage users
            areYouSure: "Oletko varma?",
            wantToChangeUserStatus: "Haluatko varmasti muuttaa tämän käyttäjän tilaa?",
            wantToVerifyUser: "Haluatko varmasti vahvistaa tämän käyttäjän?",
            wantToActivateUser: "Haluatko varmasti aktivoida tämän käyttäjän?",
            yes: "Kyllä",
            no: "Ei",
            close: "Sulje",
            actions: "Toiminnot",
            changePassword: "Vaihda salasana",
            changeRole: "Vaihda roolia",
            verifyUser: "Vahvista käyttäjä",
            deactivateUser: "Poista käyttäjä käytöstä",
            activateUser: "Aktivoi käyttäjä",
            avatar: "Avatar",
            addUser: "Lisää",
            fullName: "Koko nimi",
            gender: "Sukupuoli",
            role: "Rooli",
            confirmPassword: "Vahvista salasana",
            columnName: "Nimi",
            columnVerified: "Vahvistettu",
            columnDomain: "Verkkotunnus",
            columnStatus: "Tila",
            columnActions: "Toiminnot",
            nameRequired: "Nimi vaaditaan",
            invalidEmail: "Sähköpostiosoite on virheellinen",
            emailRequired: "Sähköposti vaaditaan",
            passwordMin: "Salasanan on oltava vähintään 8 merkkiä",
            passwordRequired: "Salasana vaaditaan",
            passwordsMustMatch: "Salasanojen on täsmättävä",
            confirmPasswordRequired: "Vahvista salasana vaaditaan",
            notAssigned: "ei määritetty",

            //Manage domain
            actions: "Toiminnot",
            extendTrial30Days: "Jatka kokeilua 30 päivällä",
            makePaidSubscription: "Tee tilaus maksulliseksi",
            downgradeToTrial: "Alenna kokeiluversioksi",
            extendTrialOneYear: "Jatka kokeilua yhdellä vuodella",
            terminateDomain: "Mitätöi domain",
            domain: "Domain",
            validBeforeAt: "Voimassa Ennen",
            type: "Tyyppi",
            company: "Yritys",
            vatId: "ALV-tunnus",
            phone: "Puhelin",
            email: "Sähköposti",
            country: "Maa",
            edit: "Muokkaa",
            paid: "Makssullinen",
            trial: "Kokeilu",
            previous: "Edellinen",
            next: "Seuraava",

            //Change password
            passwordChange: "Salasanan Vaihto",
            password: "Salasana",
            confirmPassword: "Vahvista Salasana",
            change: "Vaihda",
            close: "Sulje",

            //Manage domain form
            manageDomain: "Hallinnoi Domainia",
            technicalContactEmail: "Tekninen Yhteyshenkilön Sähköposti",
            billingContactEmail: "Laskutuksen Yhteyshenkilön Sähköposti",
            mobileNumber: "Matkapuhelinnumero",
            companyName: "Yrityksen Nimi",
            addressLine1: "Osoite 1",
            addressLine2: "Osoite 2",
            city: "Kaupunki",
            country: "Maa",
            zip: "Postinumero",
            vatId: "ALV-tunnus",
            save: "Tallenna",
            invalidEmail: "Virheellinen sähköpostiosoite",
            required: "Vaadittu",
            mobileNumberStringError:
                "Matkapuhelinnumeron tulee olla merkkijonona maakoodin kanssa",

            //manage roles
            add: "Lisää",
            numberSign: "#",
            name: "Nimi",
            noData: "Ei tietoja",
            edit: "Muokkaa",
            remove: "Poista",
            previous: "Edellinen",
            next: "Seuraava",
            domain: "Domaini",

            addRole: "Lisää Rooli",
            editRole: "Muokkaa Roolia",
            roleName: "Roolin Nimi",
            permission: "Oikeudet :",
            save: "Tallenna",
            required: "Vaadittu",
            allDomains: "Kaikki domainit",

            //my profile
            myDetails: "Omat tiedot",
            uploadImage: "Lataa kuva",
            removeImage: "Poista kuva",
            cropImage: "Rajaa kuva",
            capturePhoto: "Ota valokuva",
            fullname: "Koko nimi",
            gender: "Sukupuoli",
            male: "Mies",
            female: "Nainen",
            save: "Tallenna",
            saving: "Tallennetaan...",
            nameRequired: "Nimi vaaditaan",
            genderRequired: "Sukupuoli vaaditaan",
            loading: "Ladataan...",
            saved: "Profiilisi on tallennettu onnistuneesti.",

            //publichome
            video:
                "Katsoaksesi tämän videon ota JavaScript käyttöön, ja harkitse päivittämistä",
            web: "verkkoselaimeen, joka",
            support: "tukee HTML5-videota",
            copyright:
                "| i4ware - SDK | Tekijänoikeudet © i4ware Software 2004-2024, kaikki oikeudet pidätetään. | Versio 1.0.0",

            //Messagelist
            your_browser_not_support_video_tag: "Selaimesi ei tue video tagia.",
            generateSpeech: "Luo puhe",
            stopSpeech: "Pysäytä puhe",

            //PusherChat
            send: "Lähetä",
            typing: "kirjoittaa...",
            box: "Kirjoita viesti...",
            browse: "Selaa",
            capturePhoto: "Ota Kuva",
            upload_image_with_message: "Lataa kuva viestin kassa",
            capture_image_with_message: "Kaappaa kuva viestin kanssa",
            capture_video_with_message: "Kaappaa video viestin kanssa",
            speech_to_text: "Puhe tekstiksi",
            ask_from_ai: "Kysy tekoälyltä",
            close: "Sulje",
            enter_your_message: "Kirjoita viestisi tähän...",
            start_video: "Aloita Video",
            stop_video: "Lopeta Video",
            upload: "Lataa ja lähetä",
            duration: "Kesto",
            upload_successful: "Lataus onnistui",
            image_upload_successful: "Kuvan lataus onnistui",
            pdf_upload_successful: "PDF:n lataus onnistui",
            capture_successful: "Kuvan kaappaus onnistui",
            video_capture_successful: "Videon kaappaus onnistui",
            please_select_file: "Olehyvä ja valitse tiedosto minkä haluat ladata",
            failed_to_upload_file:
                "Tiedoston lataus epäonnistui. Olehyvä ja yritä uudestaan.",
            your_browser_not_support_video_tag: "Selaimesi ei tue video tagia.",
            aiTypingIndicator: "Tekoäly miettii ...",
            record_audio: "Näuhoita ääni",
            speech: "nauhoittaa puhetta...",
            please_capture_image: "Olehyvä ja kaappaa kuva ladataksesi",
            please_capture_video: "Olehyvä ja kaappaa video ladataksesi",
            please_write_message: "Olehyvä ja kirjoita viesti lähettääksesi",
            generate_image: "Luo kuva",
            // ROHTO engineering form fields
            rohto_role_label: "Rooli (kuka minä olen / ketä pyydän olemaan?)",
            rohto_role_placeholder:
                "Esim. 'Toimi tekoälyavustajana' tai 'Olen lakimies...'",
            rohto_problem_label: "Ohjeet (mitkä ovat ohjeet?)",
            rohto_problem_placeholder: "Kuvaa ohjeesi tai kysymyksesi",
            rohto_history_label: "Huomiot (mitkä ovat huomiosi?)",
            rohto_history_placeholder:
                "Jaa tehtävä selkeisiin vaiheisiin vastauksen selkeyttämiseksi",
            rohto_goal_label: "Tavoite (mitä haluat saavuttaa?)",
            rohto_goal_placeholder: "Kerro mitä toivot tulokseksi",
            rohto_expectation_label: "Osuvuus (millaista vastausta odotat?)",
            rohto_expectation_placeholder:
                "Tarkenna mitä haluat sen käsittelevän ja jättävän pois",
            rohto_for_prompt: "Kysymykseni on",
            rohto_disable: "Poista ROHTO käytöstä",
            rohto_enable: "Ota ROHTO käyttöön",
            upload_pdf: "Lataa PDF",
            upload_failure: "Lataus epäonnistui",
            pdf_upload_failure: "PDF:n lataus epäonnistui. Ole hyvä ja yritä uudestaan.",

            //Errorregistration
            error: "Virheviestit",
            error_messages: "Tässä ovat virheet rekisteröintilomakkeessasi:",
            email_error: "Sähköposti on jo otettu",
            email_error_valid: "Sähköposti ei ole kelvollinen",
            domain_error: "Verkkotunnus on jo otettu",
            domain_error_valid: "Verkkotunnus ei ole kelvollinen",
            close: "Sulje",
            end_message: "Ole hyvä ja korjaa virheet ja yritä uudelleen.",

            //Registration form
            email: "Sähköposti",
            enteremail: "Syötä sähköpostiosoite",
            newershare: "Enme koskaan jaa sähköpostiosoitettasi muille.",
            password: "Salasana",
            male: "Mies",
            female: "Nainen",
            account: "Minulla on jo tili?",
            register: "Rekisteröidy",
            confirmPassword: "Vahvista salasana",
            domain: "Verkkotunnus",
            error: "Odottamaton virhe!",
            gender: "Sukupuoli",
            name: "Nimi",
            company_name: "Yrityksen nimi",
            neverShareCompany: "Emme koskaan jaa yrityksesi nimeä kenenkään muun kanssa.",
            success_registration: "Rekisteräinti onnistui ja vahvistus sähköposti on lähetetty.",
            selectPrivacyPolicy: "Valitse tietosuojakäytäntö.",
            neverShareName: "Emme koskaan jaa nimeäsi kenenkään muun kanssa.",
            neverShareGender: "Emme koskaan jaa sukupuoltasi kenenkään muun kanssa.",
            domainInUse: "Sinun on tiedettävä käytössä oleva oikea verkkotunnus.",
            neverShareDomain: "Emme koskaan jaa verkkotunnustasi kenenkään muun kanssa.",
            passwordStronglyCrypted: "Salasana on vahvasti salattu ja turvallinen tietokannassamme.",
            privacyPolicy: "Tietosuojakäytäntö",
            dataProcessingAgreement: "Tietojenkäsittelysopimus",
            agreedOn: "Hyväksyt",
            and: "ja",
            required: "Vaadittu",
            register: "Rekisteröidy",
            loginHere: "Kirjaudu tästä",
            tooLong: "Liian pitkä!",
            tooShort: "Liian lyhyt!",
            invalidEmail: "Virheellinen sähköpostiosoite",
            invalidDomain: "Verkkotunnus on virheellinen",
            passwordsDontMatch: "Salasanan ja vahvistetun salasanan tulee olla sama.",
            vat_id: "ALV-tunnus",
            neverShareVatId: "Emme koskaan jaa ALV-tunnustasi kenenkään muun kanssa.",
            business_id: "Y-tunnus",
            neverShareBusinessId: "Emme koskaan jaa Y-tunnustasi kenenkään muun kanssa.",
            address_line_1: "Osoiterivi 1",
            neverShareAddress: "Emme koskaan jaa osoitettasi kenenkään muun kanssa.",
            address_line_2: "Osoiterivi 2",
            city: "Kaupunki",
            neverShareCity: "Emme koskaan jaa kaupunkiasi kenenkään muun kanssa.",
            country: "Maa",
            neverShareCountry: "Emme koskaan jaa maatasi kenenkään muun kanssa.",
            zip: "Postinumero",
            neverShareZip: "Emme koskaan jaa postinumeroasi kenenkään muun kanssa.",
            mobile_no: "Puhelinnumero",
            neverShareMobileNo: "Emme koskaan jaa puhelinnumeroasi kenenkään muun kanssa.",

            //Reset password

            neverShareEmail: "Emme koskaan jaa sähköpostiosoitettasi kenenkään muun kanssa.",
            submit: "Lähetä",
            noAccount: "Eikö sinulla ole tiliä?",
            register: "Rekisteröidy",
            orLogin: "tai kirjaudu?",
            login: "Kirjaudu sisään",
            email: "Sähköposti",
            passwordResetSuccess: "Salasanan nollaus onnistui ja vahvistussähköposti on lähetetty.",
            invalidEmail: "Virheellinen sähköpostiosoite",
            required: "Vaadittu",
            tooLong: "Liian pitkä!",

            year: "Vuosi",

            // Cumulative charts
            title: "Cumulative Sales Chart",
            error: "Failed to fetch transactions. Please try again.",
            loading: "Loading...",
            name: "Cumulative Vendor Balance",

            //Customer table
            customertitle: "Asiakkaat",
            customererror: "Tapahtumien hakeminen epäonnistui, yritä uudelleen",
            loading: "Ladataan...",

            //income
            incometitle: "Kuukausitulot", loading: "Ladataan...", incomeerror: "Kuukausitulojen hakeminen epäonnistui.", total: "Yhteensä",
            src_all: "Kaikki lähteet", src_atlassian: "Atlassian Pty Ltd", src_kela: "Eläkevakuutus",
            src_hourly: "Tuntiveloitusasiakkaat", src_grandparents: "Isovanhempien perintö",

            //Transactions
            transationtitle: "Yearly Sales Transactions",
            transactionerror: "Failed to fetch transactions. Please try again.",
            loading: "Loading...",
            transactionname: "Vendor Balance",

            //Transactiontable
            transactiontabletitle: "Transactions with Bar Chart",
            transactiontableerror: "Failed to fetch transactions. Please try again.",
            loading: "Loading...",
            transactiontablename: "Vendor Amount",

            //Settings
            showCaptcha: "Näytä Captcha rekisteröintilomakkeessa",
            disableRegistration: "Estä rekisteröinti muilta kuin domainin omistajilta",
            settingUpdated: "Asetukset päivitetty",
            disableLicenseDetails: "Deaktivoi lisenssitiedot",
            enableNetvisor: "Aktivoi Netvisor",

            //ShowResetPassword
            invalidEmail: "Virheellinen sähköpostiosoite",
            required: "Vaadittu",
            tooLong: "Liian pitkä!",
            tooShort: "Liian lyhyt!",
            passwordsDontMatch: "Salasanan ja vahvistetun salasanan tulee olla sama.",
            passwordResetSuccessful: "Salasanan nollaus onnistui.",
            neverShareEmail: "Emme koskaan jaa sähköpostiosoitettasi kenenkään muun kanssa.",
            passwordStronglyEncrypted: "Salasana on vahvasti salattu ja turvallinen tietokannassamme.",
            submit: "Lähetä",
            noAccount: "Eikö sinulla ole tiliä?",
            register: "Rekisteröidy",
            orLogin: "tai kirjaudu?",
            login: "Kirjaudu sisään",
            newershare: "Emme koskaan jaa sähköpostiasi kenellekään.",
            email: "Sähköposti",
            password: "Salasana",
            confirmPassword: "Vahvista salasana",

            //ModalDelete
            are_you_sure: "Oletko varma?",
            are_you_sure_text_delete: "Oletko varma, että haluat poistaa tämän STL-mallin ja sen kuvakaappauksen? Tätä toimintoa ei voi kumota.",
            yes_delete: "Kyllä, poista se",
            no_delete: "Ei, peruuta",
            are_you_sure_text_modalphoto: "Oletko varma, että haluat poistaa tämän kohteen? Tätä toimintoa ei voi kumota.",

            //STLViewer
            viewSTL: "Näytä STL",
            modelViewerTitle: "3D-mallin katseluohjelma",
            close: "Sulje",
            loading: "Ladataan...",
            delete: "Poista",
            isLoading: "Ladataan lisää kohteita...",
            generateSpaceship: "Luo avaruusalus",
            generateCyborg: "Luo kyborgi",
            generating: "Luodaan...",
            isGenerating: "Luodaan 3D-mallia ja kuvakaappausta...",
            generateCar: "Luo urheiluauto",

            //VideoPhoto
            videoPhoto: "Video/Kuva",
            uploadPhoto: "Lataa kuva",
            capturePhoto: "Ota kuva",
            uploadVideo: "Lataa video",
            captureVideo: "Ota video",
            uploadSuccess: "Lataus onnistui",
            imageUploadSuccess: "Kuva ladattu onnistuneesti!",
            videoUploadSuccess: "Video ladattu onnistuneesti!",
            uploadError: "Latausvirhe",
            imageTypeNotSupported: "Kuvatyyppiä ei tueta. Lataa JPEG (jpg) tai PNG (png) kuva.",
            videoSizeTooLarge: "Videotiedosto on liian suuri. Lataa videotiedosto, joka on alle 100 Mt.",

            //WebCam
            capturePhoto: "Ota valokuva",
            upload: "Lataa",
            removeImage: "Poista kuva",
            closeOverlay: "Sulje",
        }
    },
    sv: {
        translation: {
            login: "Logga in",
            logout: "Logga ut",
            myProfile: "Min profil",
            stlViewer: "3D-visningsprogram",
            manageUsers: "Hantera användare",
            manageDomains: "Hantera domäner",
            manageRoles: "Hantera roller",
            settings: "Inställningar",
            welcome: "Välkommen",
            videoPhoto: "Video/Foto",
            chat: "Chatt",
            revenueReport: "Intäkter",
            timesheet: "Tidrapport",
            unauthorized: "Du är obehörig!",

            /*Timesheet's translations - swedish*/
            timesheetNameLabel: "Tidkortets namn",
            timesheetNamePlaceholder: "Ange tidkortets namn",

            //employee
            employeeLabel: "Anställd",
            employeePlaceholder: "Ange ditt namn",

            //job
            jobTitleLabel: "Jobbtitel",
            jobTitlePlaceholder: "Ange jobbtitel",

            //project
            projectLabel: "Kostnadsställe / Projekt",
            projectPlaceholder: "Ange kostnadsställe eller projekt",
            dateLabel: "Datum",
            startTimeLabel: "Starttid",
            endTimeLabel: "Sluttid",
            normalHoursLabel: "Normaltimmar",
            normalHoursPlaceholder: "Ange arbetade timmar",

            //extras
            extrasLaLabel: "Tillägg lör",
            extrasSuLabel: "Tillägg sön",
            extrasEveningLabel: "Tillägg kväll",
            extrasNightLabel: "Tillägg natt",
            extrasPlaceholder: "Ange timmar om det finns",
            showExtrasPlaceholder: "Fyll i",

            //overtimes
            overtimeVrk50Label: "Övertid dag 50%",
            overtimeVrk100Label: "Övertid dag 100%",
            overtimeVko50Label: "Övertid vecka 50%",
            overtimeVko100Label: "Övertid vecka 100%",
            overtimePlaceholder: "Ange timmar om det finns",
            showOvertimePlaceholder: "Fyll i",

            //compensations
            atvLabel: "ATV (helgtimmar)",
            travelLabel: "Resetimmar",
            mealLabel: "Måltidsersättning",

            toolCompLabel: "Verktygsersättning",
            toolCompPlaceholder: "Ange i euro",

            //daily allowance
            dailyAllowance: "Dagtraktamente",
            none: "Ingen",
            partial: "Delvis",
            full: "Hel",

            //kilometers
            kmLabel: "Kilometersättning",
            kmPlaceholder: "Ange kilometer",
            kmNoteLabel: "Anteckning om kilometersättning",
            kmNotePlaceholder: "Syfte med resan (t.ex. möte)",
            kmDescInfo: "Fyll i",

            //notes and memo
            noteLabel: "Noteringar",
            notePlaceholder: "Kort notering, t.ex. försening eller särskilda omständigheter",

            memoLabel: "MEMO",
            memoPlaceholder: "Skriv detaljerad beskrivning eller anteckning här",

            //buttons
            toggleExtrasShow: "Visa tillägg",
            toggleExtrasHide: "Dölj tillägg",

            toggleOvertimeShow: "Visa övertid",
            toggleOvertimeHide: "Dölj övertid",

            addRowButton: "➕ Lägg till rad",
            clearAllButton: "🗑 Rensa allt",

            //validations and messages
            messageTooBig: "För stort tal",
            messageTooSmall: "Ogiltigt tal",

            requiredField: "Detta fält är obligatoriskt",

            successSendForm: "Raden har lagts till",
            errorSendForm: "Det gick inte att lägga till raden",

            successClearForm: "Alla data har rensats",
            errorClearForm: "Rensning misslyckades",
            emptyClearForm: "Inget att rensa eftersom formuläret är tomt",

            timeValidationMessage: "Starttiden kan inte vara senare än sluttiden",

            //summary
            summaryHeader: "Sammanfattning",
            //Audio recorder
            ask_from_ai: "Fråga AI",
            waveform: "Ljudspår",
            volume: "Volymmätare",
            male: "Man",
            female: "Kvinna",
            generate_image: "Generera bild",

            //Email verification
            emailVerification: "E-postverifiering",
            goToLogin: "Gå till inloggning?",
            loginHere: "Logga in här",

            // File upload form
            uploadStlFile: "Ladda upp STL-fil",
            browse: "Bläddra...",
            upload: "Ladda upp",
            chose: "Du valde fil:",
            press: "Tryck på Ladda upp för att ladda upp den.",

            cropImage: "Beskär bild",
            delete: "Radera",

            //Login page
            email: "E-postadress",
            enteremail: "Ange e-postadress",
            newershare: "Vi delar aldrig din e-postadress med andra.",
            password: "Lösenord",
            submit: "Skicka",
            account: "Har du inget konto?",
            register: "Registrera dig",
            forgot: "eller har du glömt lösenordet?",
            reset: "Återställ",
            error: "Oväntat fel!",
            error_username_or_password: "Användarnamn och lösenord är obligatoriska",
            error_domain_is_expired: "Användarnamn eller lösenord matchar inte, eller domänens prenumeration är ogiltig eller har löpt ut!",
            success_in_login: "Inloggning lyckades. Omdirigerar till startsidan...",

            //Manage users
            areYouSure: "Är du säker?",
            wantToChangeUserStatus: "Är du säker på att du vill ändra användarens status?",
            wantToVerifyUser: "Är du säker på att du vill verifiera användaren?",
            wantToActivateUser: "Är du säker på att du vill aktivera användaren?",
            yes: "Ja",
            no: "Nej",
            close: "Stäng",
            actions: "Åtgärder",
            changePassword: "Ändra lösenord",
            changeRole: "Ändra roll",
            verifyUser: "Verifiera användare",
            deactivateUser: "Inaktivera användare",
            activateUser: "Aktivera användare",
            avatar: "Avatar",
            addUser: "Lägg till",
            fullName: "Fullständigt namn",
            gender: "Kön",
            role: "Roll",
            confirmPassword: "Bekräfta lösenord",
            columnName: "Namn",
            columnVerified: "Verifierad",
            columnDomain: "Domän",
            columnStatus: "Status",
            columnActions: "Åtgärder",
            nameRequired: "Namn är obligatoriskt",
            invalidEmail: "Ogiltig e-postadress",
            emailRequired: "E-post är obligatoriskt",
            passwordMin: "Lösenordet måste vara minst 8 tecken",
            passwordRequired: "Lösenord är obligatoriskt",
            passwordsMustMatch: "Lösenorden måste matcha",
            confirmPasswordRequired: "Bekräfta lösenord är obligatoriskt",
            notAssigned: "ej tilldelad",

            //Manage Domain
            actions: "Åtgärder",
            extendTrial30Days: "Förläng provperioden med 30 dagar",
            makePaidSubscription: "Gör prenumeration betald",
            downgradeToTrial: "Nedgradera till provperiod",
            extendTrialOneYear: "Förläng provperioden med ett år",
            terminateDomain: "Avsluta domän",
            domain: "Domän",
            validBeforeAt: "Giltig till",
            type: "Typ",
            company: "Företag",
            vatId: "Momsnummer",
            phone: "Telefon",
            email: "E-post",
            country: "Land",
            edit: "Redigera",
            paid: "Betald",
            trial: "Prov",
            previous: "Föregående",
            next: "Nästa",

            //Change password
            passwordChange: "Byt lösenord",
            password: "Lösenord",
            confirmPassword: "Bekräfta lösenord",
            change: "Ändra",
            close: "Stäng",

            //Manage domain form
            manageDomain: "Hantera domän",
            technicalContactEmail: "Teknisk kontaktpersons e-post",
            billingContactEmail: "Faktureringskontaktpersons e-post",
            mobileNumber: "Mobilnummer",
            companyName: "Företagsnamn",
            addressLine1: "Adressrad 1",
            addressLine2: "Adressrad 2",
            city: "Stad",
            country: "Land",
            zip: "Postnummer",
            vatId: "Momsnummer",
            save: "Spara",
            invalidEmail: "Ogiltig e-postadress",
            required: "Obligatoriskt",
            mobileNumberStringError: "Mobilnummer måste vara en sträng med landskod",

            //manage roles
            add: "Lägg till",
            numberSign: "#",
            name: "Namn",
            noData: "Inga data",
            edit: "Redigera",
            remove: "Ta bort",
            previous: "Föregående",
            next: "Nästa",
            domain: "Domän",

            addRole: "Lägg till roll",
            editRole: "Redigera roll",
            roleName: "Rollnamn",
            permission: "Behörigheter:",
            save: "Spara",
            required: "Obligatoriskt",
            allDomains: "Alla domäner",

            //my profile
            myDetails: "Mina uppgifter",
            uploadImage: "Ladda upp bild",
            removeImage: "Ta bort bild",
            cropImage: "Beskär bild",
            capturePhoto: "Ta foto",
            fullname: "Fullständigt namn",
            gender: "Kön",
            male: "Man",
            female: "Kvinna",
            save: "Spara",
            saving: "Sparar...",
            nameRequired: "Namn är obligatoriskt",
            genderRequired: "Kön är obligatoriskt",
            loading: "Laddar...",
            saved: "Din profilinformation har sparats.",

            //publichome
            video:
                "För att se den här videon, aktivera JavaScript och överväg att uppgradera",
            web: "din webbläsare till en som",
            support: "stöder HTML5-video",
            copyright:
                "| i4ware - SDK | Upphovsrätt © i4ware Software 2004-2024, alla rättigheter förbehållna. | Version 1.0.0",

            //MessageList
            your_browser_not_support_video_tag:
                "Din webbläsare stöder inte videomarkeringen.",
            generateSpeech: "Generera tal",
            stopSpeech: "Stoppa tal",

            //PusherChat
            send: "Skicka",
            typing: "skriver...",
            box: "Skriv meddelande...",
            browse: "Bläddra",
            capturePhoto: "Ta en bild",
            upload_image_with_message: "Ladda upp bild med meddelande",
            capture_image_with_message: "Fånga bild med meddelande",
            capture_video_with_message: "Fånga video med meddelande",
            speech_to_text: "Tal till text",
            ask_from_ai: "Fråga en AI",
            close: "Stäng",
            enter_your_message: "Skriv ditt meddelande här...",
            start_video: "Starta video",
            stop_video: "Stoppa video",
            upload: "Ladda upp och skicka",
            duration: "Varaktighet",
            upload_successful: "Uppladdning lyckades",
            image_upload_successful: "Bilduppladdning lyckades",
            pdf_upload_successful: "PDF-uppladdning lyckades",
            capture_successful: "Bildupptagning lyckades",
            video_capture_successful: "Videoupptagning lyckades",
            please_select_file: "Vänligen välj en fil att ladda upp",
            failed_to_upload_file: "Misslyckades med att ladda upp filen. Försök igen.",
            your_browser_not_support_video_tag:
                "Din webbläsare stöder inte videomarkeringen.",
            aiTypingIndicator: "AI tänker ...",
            record_audio: "Spela in ljud",
            speech: "spela in tal...",
            please_capture_image: "Vänligen ta en bild för att ladda upp",
            please_capture_video: "Vänligen ta en video för att ladda upp",
            please_write_message: "Vänligen skriv ett meddelande att skicka",
            generate_image: "Generera bild",
            // ROHTO engineering form fields
            rohto_role_label: "Roll (vem är jag / vem ber jag dig vara?)",
            rohto_role_placeholder:
                "T.ex. 'Agera som AI-assistent' eller 'Jag är jurist...'",
            rohto_problem_label: "Instruktioner (vilka är instruktionerna?)",
            rohto_problem_placeholder: "Beskriv dina instruktioner eller din fråga",
            rohto_history_label: "Anteckningar (vilka är dina observationer?)",
            rohto_history_placeholder:
                "Dela upp uppgiften i tydliga steg för att förtydliga svaret",
            rohto_goal_label: "Mål (vad vill du uppnå?)",
            rohto_goal_placeholder: "Beskriv vad du hoppas som resultat",
            rohto_expectation_label: "Relevans (vilket slags svar förväntar du dig?)",
            rohto_expectation_placeholder:
                "Specificera vad du vill att det ska ta upp och vad som ska utelämnas",
            rohto_for_prompt: "Min fråga är",
            rohto_disable: "Inaktivera ROHTO",
            rohto_enable: "Aktivera ROHTO",
            upload_pdf: "Ladda upp PDF",
            upload_failure: "Uppladdning misslyckades",
            pdf_upload_failure: "Misslyckades med att ladda upp PDF. Försök igen.",

            //Error Registration
            error: "Felmeddelanden",
            error_messages: "Här är felen i din registreringsformulär:",
            email_error: "E-postadressen har redan tagits",
            email_error_valid: "E-postadressen är inte giltig",
            domain_error: "Domänen har redan tagits",
            domain_error_valid: "Domänen är inte giltig",
            close: "Stäng",
            end_message: "Var god korrigera felen och försök igen.",

            //Registration form
            email: "E-post",
            enteremail: "Ange din e-postadress",
            newershare: "Jag delar aldrig din e-postadress med andra.",
            password: "Lösenord",
            male: "Man",
            female: "Kvinna",
            account: "Har redan ett konto?",
            register: "Registrera",
            confirmPassword: "Bekräfta lösenord",
            domain: "Domän",
            error: "Oväntat fel!",
            gender: "Kön",
            name: "Namn",
            company_name: "Företagsnamn",
            neverShareCompany: "Vi delar aldrig ditt företagsnamn med någon annan.",
            success_registration: "Registreringen lyckades och en bekräftelse har skickats till din e-post.",
            selectPrivacyPolicy: "Välj integritetspolicy.",
            neverShareName: "Vi delar aldrig ditt namn med någon annan.",
            neverShareGender: "Vi delar aldrig ditt kön med någon annan.",
            domainInUse: "Du måste ange en giltig domän som inte redan är i användning.",
            neverShareDomain: "Vi delar aldrig din domän med någon annan.",
            passwordStronglyCrypted: "Ditt lösenord är starkt krypterat och säkert i vår databas.",
            privacyPolicy: "Integritetspolicy",
            dataProcessingAgreement: "Dataprocessavtal",
            agreedOn: "Jag godkänner",
            and: "och",
            required: "Obligatoriskt",
            register: "Registrera",
            loginHere: "Logga in här",
            tooLong: "För långt!",
            tooShort: "För kort!",
            invalidEmail: "Ogiltig e-postadress",
            invalidDomain: "Ogiltig domän",
            passwordsDontMatch: "Lösenorden matchar inte.",
            vat_id: "MOMS-ID",
            neverShareVatId: "Vi delar aldrig ditt MOMS-ID med någon annan.",
            business_id: "Företags-ID",
            neverShareBusinessId: "Vi delar aldrig ditt företags-ID med någon annan.",
            address_line_1: "Adressrad 1",
            neverShareAddress: "Vi delar aldrig din adress med någon annan.",
            address_line_2: "Adressrad 2",
            city: "Stad",
            neverShareCity: "Vi delar aldrig din stad med någon annan.",
            country: "Land",
            neverShareCountry: "Vi delar aldrig ditt land med någon annan.",
            zip: "Postnummer",
            neverShareZip: "Vi delar aldrig ditt postnummer med någon annan.",
            mobile_no: "Telefonnummer",
            neverShareMobileNo: "Vi delar aldrig ditt telefonnummer med någon annan.",

            //Reset password
            neverShareEmail: "Vi delar aldrig din e-postadress med någon annan.",
            submit: "Skicka",
            noAccount: "Har du inget konto?",
            register: "Registrera",
            orLogin: "eller logga in?",
            login: "Logga in",
            email: "E-post",
            passwordResetSuccess: "Återställning av lösenord lyckades och en bekräftelse har skickats till din e-post.",
            invalidEmail: "Ogiltig e-postadress",
            required: "Obligatoriskt",
            tooLong: "För långt!",

            year: "År",

            //Cumulative Charts
            title: "Cumulative Sales Chart",
            error: "Failed to fetch transactions. Please try again.",
            loading: "Loading...",
            name: "Cumulative Vendor Balance",

            //Customer table
            customertitle: "Kunder",
            customererror: "Misslyckades med att hämta transaktioner. Försök igen.",
            loading: "Lastning...",

            //income
            incometitle: "Månadsinkomst", loading: "Laddar...", incomeerror: "Misslyckades att hämta månadsinkomst.", total: "Totalt",
            src_all: "Alla källor", src_atlassian: "Atlassian Pty Ltd", src_kela: "Pensionsförsäkring",
            src_hourly: "Timdebiterade kunder", src_grandparents: "Mor- och farföräldrars arv",

            //Transactions
            transactiontitle: "Yearly Sales Transactions",
            transactionerror: "Failed to fetch transactions. Please try again.",
            loading: "Loading...",
            transactionname: "Vendor Balance",

            //Transactiontable
            transactiontabletitle: "Transactions with Bar Chart",
            transactiontableerror: "Failed to fetch transactions. Please try again.",
            loading: "Loading...",
            transactiontablename: "Vendor Amount",

            //Settings
            showCaptcha: "Visa Captcha i registreringsformuläret",
            disableRegistration: "Blockera registrering för andra än domänägare",
            settingUpdated: "Inställningar uppdaterade",
            disableLicenseDetails: "Avaktivera licensinformation",
            enableNetvisor: "Aktivera Netvisor",

            //ShowResetPassword
            invalidEmail: "Ogiltig e-postadress",
            required: "Obligatoriskt",
            tooLong: "För långt!",
            tooShort: "För kort!",
            passwordsDontMatch: "Lösenord och bekräftelse lösenord måste vara samma.",
            passwordResetSuccessful: "Återställning av lösenord lyckades.",
            neverShareEmail: "Vi delar aldrig din e-postadress med någon annan.",
            passwordStronglyEncrypted: "Ditt lösenord är starkt krypterat och säkert i vår databas.",
            submit: "Skicka",
            noAccount: "Har du inget konto?",
            register: "Registrera",
            orLogin: "eller logga in?",
            login: "Logga in",
            newershare: "Vi delar aldrig din e-post med någon annan.",
            email: "E-post",
            password: "Lösenord",
            confirmPassword: "Bekräfta lösenord",

            //ModalDelete
            are_you_sure: "Är du säker?",
            are_you_sure_text_delete: "Är du säker på att du vill radera denna STL-modell och dess skärmdump? Denna åtgärd kan inte ångras.",
            yes_delete: "Ja, radera den",
            no_delete: "Nej, avbryt",
            are_you_sure_text_modalphoto: "Är du säker på att du vill radera denna post? Denna åtgärd kan inte ångras.",

            //StlViewer
            viewSTL: "Visa STL",
            modelViewerTitle: "3D-modellvisare",
            close: "Stäng",
            loading: "Laddar...",
            delete: "Radera",
            isLoading: "Laddar fler objekt...",
            generateSpaceship: "Generera rymdskepp",
            generateCyborg: "Generera cyborg",
            generating: "Genererar...",
            isGenerating: "Genererar 3D-modell och skärmdump...",
            generateCar: "Generera sportbil",

            //VideoPhoto
            videoPhoto: "Video/Foto",
            uploadPhoto: "Ladda upp foto",
            capturePhoto: "Ta foto",
            uploadVideo: "Ladda upp video",
            captureVideo: "Spela in video",
            uploadSuccess: "Uppladdning lyckades",
            imageUploadSuccess: "Bild uppladdad framgångsrikt!",
            videoUploadSuccess: "Video uppladdad framgångsrikt!",
            uploadError: "Uppladdningsfel",
            imageTypeNotSupported: "Bildtyp stöds inte. Ladda upp en JPEG (jpg) eller PNG (png) bild.",
            videoSizeTooLarge: "Videostorleken är för stor. Ladda upp en videofil mindre än 100 MB.",

            //WebCam
            capturePhoto: "Ta ett foto",
            upload: "Ladda upp",
            removeImage: "Ta bort bild",
            closeOverlay: "Stäng",
        }
    }
};

// Resolve initial language
function getInitialLanguage() {
    const saved = localStorage.getItem('appLang');
    if (saved && ['en', 'fi', 'sv'].includes(saved)) return saved;

    const fromUrl = new URLSearchParams(window.location.search).get('lang');
    if (fromUrl && ['en', 'fi', 'sv'].includes(fromUrl)) return fromUrl;

    return API_DEFAULT_LANGUAGE || 'en';
}

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: getInitialLanguage(),
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false
        }
    });

// Persist language changes
i18n.on('languageChanged', (lng) => {
    localStorage.setItem('appLang', lng);
});

export default i18n;