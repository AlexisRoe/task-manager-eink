import { render, screen } from "@testing-library/react";
import { AppProviders } from "@/app/app-providers.component";
import { StandaloneGate } from "@/app/standalone-gate.component";
import { PORTRAIT_QUERY, STANDALONE_QUERY } from "@/config/pwa.config";
import { stubMatchMedia } from "@/test/match-media.utils";

const renderGate = (enforce: boolean) =>
  render(
    <AppProviders>
      <StandaloneGate enforce={enforce}>
        <p>content</p>
      </StandaloneGate>
    </AppProviders>,
  );

describe("StandaloneGate", () => {
  afterEach(() => stubMatchMedia());

  it("renders children when not enforced", () => {
    renderGate(false);
    expect(screen.getByText("content")).toBeInTheDocument();
  });

  it("asks to install when not standalone", () => {
    renderGate(true);
    expect(screen.getByText("Install Daybook to use it")).toBeInTheDocument();
    expect(screen.queryByText("content")).not.toBeInTheDocument();
  });

  it("asks to rotate in portrait", () => {
    stubMatchMedia((query) => query === STANDALONE_QUERY || query === PORTRAIT_QUERY);
    renderGate(true);
    expect(screen.getByText("Rotate your device")).toBeInTheDocument();
  });

  it("renders children when standalone and landscape", () => {
    stubMatchMedia((query) => query === STANDALONE_QUERY);
    renderGate(true);
    expect(screen.getByText("content")).toBeInTheDocument();
  });
});
