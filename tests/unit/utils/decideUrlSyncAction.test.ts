import { decideUrlSyncAction } from "@/utils/urlParams.util";
import { describe, expect, it } from "vitest";

describe("decideUrlSyncAction", () => {
  it("mount: no prior write, URL present → external (restore)", () => {
    const action = decideUrlSyncAction({
      searchParamsChanged: true,
      searchParamsString: "a=1",
      lastWritten: null,
      nextFromState: "a=1",
    });
    expect(action).toBe("external");
  });

  it("push in flight: searchParams hasn't caught up yet → ownWrite, not external", () => {
    const action = decideUrlSyncAction({
      searchParamsChanged: false,
      searchParamsString: "a=1",
      lastWritten: "b=2",
      nextFromState: "b=2",
    });
    expect(action).toBe("ownWrite");
  });

  it("push propagated: searchParams now matches what we wrote → ownWrite", () => {
    const action = decideUrlSyncAction({
      searchParamsChanged: true,
      searchParamsString: "b=2",
      lastWritten: "b=2",
      nextFromState: "b=2",
    });
    expect(action).toBe("ownWrite");
  });

  it("back navigation: searchParams changed to something we didn't write → external", () => {
    const action = decideUrlSyncAction({
      searchParamsChanged: true,
      searchParamsString: "a=1",
      lastWritten: "b=2",
      nextFromState: "b=2",
    });
    expect(action).toBe("external");
  });

  it("reactive state change with no URL change → stateChange", () => {
    const action = decideUrlSyncAction({
      searchParamsChanged: false,
      searchParamsString: "b=2",
      lastWritten: "b=2",
      nextFromState: "c=3",
    });
    expect(action).toBe("stateChange");
  });

  it("fully settled: everything matches → ownWrite", () => {
    const action = decideUrlSyncAction({
      searchParamsChanged: false,
      searchParamsString: "b=2",
      lastWritten: "b=2",
      nextFromState: "b=2",
    });
    expect(action).toBe("ownWrite");
  });
});
