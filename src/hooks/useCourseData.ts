import { useCourseDataStore } from "@/stores/courseDataStore";

export function useCourseData() {
    const { setValue, setMany, getValue, data } = useCourseDataStore();

    return {
        setCourseData: setValue,
        setCourseDataArr: setMany,
        getCourseData: getValue,

        // debug only
        _rawData: data,
    };
}
