import { useEffect, useState } from "react";
import { Alert } from "react-native";

const useAppwrite = (fn) =>{
const [data, setdata] = useState([]);
const [isLoading, setisLoading] = useState(true);

const fetchData = async () => {
    setisLoading(true);

    try {
      const response = await fn();

      setdata(response);

    } catch (error) {
      Alert.alert('Error',error.message)
    }
    finally{
      setisLoading(false);
    }
  };

useEffect(() => {  
      fetchData();
    }, []);

    const refetch = () => fetchData();

    return { data,isLoading,refetch }
}

export default useAppwrite;