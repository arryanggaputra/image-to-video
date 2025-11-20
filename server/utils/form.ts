export const objectToFormData = <T>(data: T): FormData => {
  const formData = new FormData();
  for (const key in data) {
    if (Object.hasOwnProperty.call(data, key)) {
      const value = data[key] as unknown as string;
      formData.append(key, value);
    }
  }
  return formData;
};
