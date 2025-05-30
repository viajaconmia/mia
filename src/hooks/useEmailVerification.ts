import { URL, HEADERS_API } from "../constants/apiConstant";

export const sendAndCreateOTP = async (email: string) => {
    try {
        const response = await fetch(`${URL}/v1/otp/send-otp-pass`, {
            method: "POST",
            headers: HEADERS_API,
            body: JSON.stringify({
                "email": email
            }),
        });
        const json = await response.json();
        console.log(json);
        return json;
    } catch(error){
        console.log(error);
        return error;
    }
    
}

export const verifyOTP = async (email: string, code: string) => {
    try{
        console.log(email);
        const response = await fetch(`${URL}/v1/otp/verify-otp?email=${encodeURIComponent(email)}&code=${encodeURIComponent(code)}`, {
            method: "GET",
            headers: HEADERS_API
        });
        const json = await response.json();
        console.log(json);
        return json;
    } catch(error){
        console.log(error);
        return error;
    }
    
}