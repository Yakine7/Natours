/* eslint-disable */
import { showAlert } from "./alerts";

// type is either "password" or "data"
export const updateSettings = async (data, type) => {
    try {
        const url =
            type === "password"
                ? "/api/v1/users/updateMyPassword"
                : "/api/v1/users/updateMe";
        const res = await axios.patch(url, data);

        if (res.data.status === "success") {
            showAlert("success", `${type.toUpperCase()} updated successfully`);
            window.setTimeout(() => {
                location.assign("/me");
            }, 1500);
        }

        console.log(res);
    } catch (err) {
        showAlert("error", err.response.data.message);
    }
};
