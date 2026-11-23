import { fireEvent, render, screen } from "@testing-library/react";
import { App } from "@/app/app.component";
import { APP_COMMIT, APP_VERSION } from "@/config/build.config";
import { resetUiStore } from "@/store/ui.store";
import * as serviceWorker from "@/utils/service-worker.utils";

beforeEach(() => resetUiStore());
afterEach(() => vi.restoreAllMocks());

describe("About modal", () => {
  it("opens from the title and shows the build info", async () => {
    render(<App />);
    fireEvent.click(await screen.findByRole("button", { name: "About Daybook" }));
    expect(await screen.findByText(APP_VERSION)).toBeInTheDocument();
    expect(screen.getByText(APP_COMMIT)).toBeInTheDocument();
    fireEvent.click(screen.getAllByRole("button", { name: "Close" })[0] as HTMLElement);
    expect(screen.queryByText(APP_VERSION)).not.toBeInTheDocument();
  });

  it("checks for updates on demand and reports the result", async () => {
    vi.spyOn(serviceWorker, "checkForUpdate").mockResolvedValue("current");
    render(<App />);
    fireEvent.click(await screen.findByRole("button", { name: "About Daybook" }));
    fireEvent.click(await screen.findByRole("button", { name: "Check for updates" }));
    expect(await screen.findByText("You are on the latest version.")).toBeInTheDocument();
  });
});
