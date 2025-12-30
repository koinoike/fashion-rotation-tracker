import {
  seasonConfig,
  PODIUM_FILES,
  getTotalCollections,
  getOutfitPathsForSlot,
  hasIndependentPodiums,
  getCollectionOrder,
} from "./seasonConfig.js";

describe("Winter Independent Podiums - Debug from Scratch", () => {
  describe("Step 1: Verify PODIUM_FILES is built correctly", () => {
    test("PODIUM_FILES.winter should exist", () => {
      expect(PODIUM_FILES.winter).toBeDefined();
    });

    test("PODIUM_FILES.winter should have left, center, right", () => {
      expect(PODIUM_FILES.winter.left).toBeDefined();
      expect(PODIUM_FILES.winter.center).toBeDefined();
      expect(PODIUM_FILES.winter.right).toBeDefined();
    });

    test("PODIUM_FILES.winter.left should be ['3_1.png', '3_1.png', '3_1.png', '3_1.png']", () => {
      expect(PODIUM_FILES.winter.left).toEqual([
        "3_1.png",
        "3_1.png",
        "3_1.png",
        "3_1.png",
      ]);
    });

    test("PODIUM_FILES.winter.center should be ['1_2.png', '2_2.png', '3_2.png', '4_2.png']", () => {
      expect(PODIUM_FILES.winter.center).toEqual([
        "1_2.png",
        "2_2.png",
        "3_2.png",
        "4_2.png",
      ]);
    });

    test("PODIUM_FILES.winter.right should be ['2_3.png', '2_3.png', '3_3.png', '4_3.png']", () => {
      expect(PODIUM_FILES.winter.right).toEqual([
        "2_3.png",
        "2_3.png",
        "3_3.png",
        "4_3.png",
      ]);
    });
  });

  describe("Step 2: Verify hasIndependentPodiums returns true", () => {
    test("hasIndependentPodiums('winter') should be true", () => {
      const result = hasIndependentPodiums("winter");
      console.log("hasIndependentPodiums('winter'):", result);
      expect(result).toBe(true);
    });
  });

  describe("Step 3: Verify getTotalCollections returns 4", () => {
    test("getTotalCollections('winter') should be 4", () => {
      const total = getTotalCollections("winter");
      console.log("getTotalCollections('winter'):", total);
      expect(total).toBe(4);
    });
  });

  describe("Step 4: Test getOutfitPathsForSlot for each collection", () => {
    test("Collection 1 (slot 0) should show: 3_1, 1_2, 2_3", () => {
      const paths = getOutfitPathsForSlot("winter", 0);
      console.log("Collection 1 paths:", paths);

      expect(paths).toEqual([
        "/assets/transparent/winter/3_1.png",
        "/assets/transparent/winter/1_2.png",
        "/assets/transparent/winter/2_3.png",
      ]);
    });

    test("Collection 2 (slot 1) should show: 3_1, 2_2, 2_3", () => {
      const paths = getOutfitPathsForSlot("winter", 1);
      console.log("Collection 2 paths:", paths);

      expect(paths).toEqual([
        "/assets/transparent/winter/3_1.png",
        "/assets/transparent/winter/2_2.png",
        "/assets/transparent/winter/2_3.png",
      ]);
    });

    test("Collection 3 (slot 2) should show: 3_1, 3_2, 3_3", () => {
      const paths = getOutfitPathsForSlot("winter", 2);
      console.log("Collection 3 paths:", paths);

      expect(paths).toEqual([
        "/assets/transparent/winter/3_1.png",
        "/assets/transparent/winter/3_2.png",
        "/assets/transparent/winter/3_3.png",
      ]);
    });

    test("Collection 4 (slot 3) should show: 3_1, 4_2, 4_3", () => {
      const paths = getOutfitPathsForSlot("winter", 3);
      console.log("Collection 4 paths:", paths);

      expect(paths).toEqual([
        "/assets/transparent/winter/3_1.png",
        "/assets/transparent/winter/4_2.png",
        "/assets/transparent/winter/4_3.png",
      ]);
    });
  });

  describe("Step 5: Verify left podium is frozen at 3_1.png", () => {
    test("All 4 collections should have 3_1.png on the left", () => {
      const collections = [0, 1, 2, 3];
      const leftPaths = collections.map(
        (i) => getOutfitPathsForSlot("winter", i)[0]
      );

      console.log("Left podium across all collections:", leftPaths);

      expect(leftPaths).toEqual([
        "/assets/transparent/winter/3_1.png",
        "/assets/transparent/winter/3_1.png",
        "/assets/transparent/winter/3_1.png",
        "/assets/transparent/winter/3_1.png",
      ]);
    });
  });

  describe("Step 6: Verify center podium advances", () => {
    test("Center podium should advance: 1→2→3→4", () => {
      const collections = [0, 1, 2, 3];
      const centerPaths = collections.map(
        (i) => getOutfitPathsForSlot("winter", i)[1]
      );

      console.log("Center podium across all collections:", centerPaths);

      expect(centerPaths).toEqual([
        "/assets/transparent/winter/1_2.png",
        "/assets/transparent/winter/2_2.png",
        "/assets/transparent/winter/3_2.png",
        "/assets/transparent/winter/4_2.png",
      ]);
    });
  });

  describe("Step 7: Verify right podium pattern", () => {
    test("Right podium should follow pattern: 2→2→3→4", () => {
      const collections = [0, 1, 2, 3];
      const rightPaths = collections.map(
        (i) => getOutfitPathsForSlot("winter", i)[2]
      );

      console.log("Right podium across all collections:", rightPaths);

      expect(rightPaths).toEqual([
        "/assets/transparent/winter/2_3.png",
        "/assets/transparent/winter/2_3.png",
        "/assets/transparent/winter/3_3.png",
        "/assets/transparent/winter/4_3.png",
      ]);
    });
  });

  describe("Step 8: Full visualization", () => {
    test("Visualize all 4 winter collections with independent podiums", () => {
      const visualization = [0, 1, 2, 3].map((slot) => {
        const paths = getOutfitPathsForSlot("winter", slot);
        return {
          collection: slot + 1,
          left: paths[0].split("/").pop(),
          center: paths[1].split("/").pop(),
          right: paths[2].split("/").pop(),
        };
      });

      console.log("Full Winter Visualization:");
      console.table(visualization);

      expect(visualization).toEqual([
        { collection: 1, left: "3_1.png", center: "1_2.png", right: "2_3.png" },
        { collection: 2, left: "3_1.png", center: "2_2.png", right: "2_3.png" },
        { collection: 3, left: "3_1.png", center: "3_2.png", right: "3_3.png" },
        { collection: 4, left: "3_1.png", center: "4_2.png", right: "4_3.png" },
      ]);
    });
  });

  describe("Step 9: Verify getCollectionOrder", () => {
    test("getCollectionOrder('winter') should return [1, 2, 3, 4]", () => {
      const order = getCollectionOrder("winter");
      console.log("Winter collection order:", order);
      expect(order).toEqual([1, 2, 3, 4]);
    });
  });
});
