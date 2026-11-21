jest.mock("expo-router", () => ({
  useRouter: () => ({
    replace: jest.fn(),
  }),
}));

jest.mock("./bookService", () => ({
  crearLibro: jest.fn(),
}));

import { act, create, type ReactTestRenderer } from "react-test-renderer";
import NewBookScreen from "../../app/libro/nuevo";
import { crearLibro } from "./bookService";

describe("NewBookScreen", () => {
  it("muestra error y no envía si falta el título", () => {
    let view: ReactTestRenderer;
    act(() => {
      view = create(<NewBookScreen />);
    });
    act(() => {
      view!.root
        .findByProps({ accessibilityLabel: "Autor del libro" })
        .props.onChangeText("Autor");
    });
    act(() => {
      view!.root
        .findByProps({ accessibilityLabel: "Guardar libro" })
        .props.onPress();
    });
    const alert = view!.root.findByProps({ accessibilityRole: "alert" });
    expect(alert.props.children).toMatch(/El título es obligatorio/);
    expect(crearLibro).not.toHaveBeenCalled();
  });
});
