import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  formDrafts: {}, // maps courseId -> form input object (including File objects)
};

const courseSlice = createSlice({
  name: "courseSlice",
  initialState,
  reducers: {
    saveFormDraft: (state, action) => {
      const { courseId, input } = action.payload;
      state.formDrafts[courseId] = input;
    },
    clearFormDraft: (state, action) => {
      const { courseId } = action.payload;
      delete state.formDrafts[courseId];
    },
  },
});

export const { saveFormDraft, clearFormDraft } = courseSlice.actions;
export default courseSlice.reducer;
