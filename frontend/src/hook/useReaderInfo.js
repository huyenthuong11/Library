import { useState, useEffect } from "react";
import api from "../lib/axios";

export default function useReaderInfo(accountId) {
    const [readerInfo, setReaderInfo] = useState({});
    const { account } = useContext(AuthContext);
    const getReaderInfo = async () => {
        try {
            const response = await api.get("/reader/readerProfile", {
                params: {
                    accountId: account?.id,
                }
            });
            const data = response.data;
            setReaderInfo(data);
            console.log("DATA:  page.js:52 - useReaderInfo.js:16", data);
        } catch (err) {
            console.error("Failed to fetch reader info:  page.js:54 - useReaderInfo.js:18", err);
        }
    }

    useEffect(() => {
        if(!accountId) {
            return;
        }
        getReaderInfo();
    }, [accountId]);

    const fullName = readerInfo.fullName;
    const dateOfBirth = readerInfo.dateOfBirth;
    const phoneNumber = readerInfo.phoneNumber;
    const avatar = readerInfo.avatar;
    return {fullName, dateOfBirth, phoneNumber, avatar, refreshReaderInfo: getReaderInfo};
}