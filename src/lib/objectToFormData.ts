// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function objectToFormData(data: Record<string, any>): FormData {
    const formData = new FormData();
    Object.keys(data).forEach((key) => {
        const value = data[key];
        if (value === null || value === undefined) return;
        formData.append(key, value);
    });
    return formData;
}
