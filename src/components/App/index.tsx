import pixelmatch from "pixelmatch";
import classNames from "classnames/bind";
import styles from "./index.module.scss";
import {
  CAMERA_ORIENTATION_IDS,
  IMAGE_SIZES,
  ImageLabels,
} from "../../constants";
import ImageCard from "../ImageCard";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import Loading from "../Loading";
import DiffVisualizer from "../DiffVisualizer";

const cx = classNames.bind(styles);

const App = () => {
  // kenny: CameraOrientation -> co
  const [currentCoId, setCurrentCoId] = useState(CAMERA_ORIENTATION_IDS[0]);
  const [threshold, setThreshold] = useState(0.15);
  const [isLoading, setIsLoading] = useState(false);
  const [prevCtx, setPrevCtx] = useState<CanvasRenderingContext2D>();
  const [currentCtx, setCurrentCtx] = useState<CanvasRenderingContext2D>();

  const prevImgRef = useRef<HTMLImageElement>(null);
  const currentImgRef = useRef<HTMLImageElement>(null);
  const diffCanvasRef = useRef<HTMLCanvasElement>(null);

  const getImageUrl = (label: ImageLabels) => {
    return `/snapshot-diff/assets/images/co${currentCoId}-${label}.png`;
  };

  useEffect(() => {
    if (!prevCtx) {
      const canvas = document.createElement("canvas");
      canvas.width = IMAGE_SIZES.to.width;
      canvas.height = IMAGE_SIZES.to.height;
      const context = canvas.getContext("2d");
      if (!context) return;

      setPrevCtx(context);
    }
  }, [prevCtx]);

  useEffect(() => {
    if (!currentCtx) {
      const canvas = document.createElement("canvas");
      canvas.width = IMAGE_SIZES.to.width;
      canvas.height = IMAGE_SIZES.to.height;
      const context = canvas.getContext("2d");
      if (!context) return;

      setCurrentCtx(context);
    }
  }, [currentCtx]);

  useEffect(() => {
    if (diffCanvasRef.current) {
      diffCanvasRef.current.width = IMAGE_SIZES.to.width;
      diffCanvasRef.current.height = IMAGE_SIZES.to.height;
    }
  }, []);

  const createCoButtonClickHandler = (id: number) => () => {
    setCurrentCoId(id);
  };

  const handleActionButtonClick = () => {
    if (!prevImgRef.current || !currentImgRef.current || !diffCanvasRef.current)
      return;
    if (!prevCtx || !currentCtx) return;

    setIsLoading(true);

    const prevImg = prevImgRef.current;
    prevCtx.drawImage(
      prevImg,
      0,
      0,
      IMAGE_SIZES.from.width,
      IMAGE_SIZES.from.height,
      0,
      0,
      IMAGE_SIZES.to.width,
      IMAGE_SIZES.to.height
    );
    const prevImageData = prevCtx.getImageData(
      0,
      0,
      IMAGE_SIZES.to.width,
      IMAGE_SIZES.to.height
    );

    const currentImg = currentImgRef.current;
    currentCtx.drawImage(
      currentImg,
      0,
      0,
      IMAGE_SIZES.from.width,
      IMAGE_SIZES.from.height,
      0,
      0,
      IMAGE_SIZES.to.width,
      IMAGE_SIZES.to.height
    );
    const currentImageData = currentCtx.getImageData(
      0,
      0,
      IMAGE_SIZES.to.width,
      IMAGE_SIZES.to.height
    );

    const diffCtx = diffCanvasRef.current.getContext("2d");
    if (!diffCtx) return;

    const diff = diffCtx.createImageData(
      IMAGE_SIZES.to.width,
      IMAGE_SIZES.to.height
    );
    pixelmatch(
      prevImageData.data,
      currentImageData.data,
      diff.data,
      IMAGE_SIZES.to.width,
      IMAGE_SIZES.to.height,
      { threshold, diffColor: [216, 0, 50] }
    );
    diffCtx.putImageData(diff, 0, 0);

    setIsLoading(false);
  };

  const handleRangeInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setThreshold(parseFloat(event.target.value));
  };

  return (
    <div className={cx("container")}>
      <div className={cx("buttons")}>
        <ol className={cx("coIds")}>
          {CAMERA_ORIENTATION_IDS.map((id) => (
            <li key={id} className={cx("coId")}>
              <button
                disabled={isLoading}
                className={cx("coButton")}
                onClick={createCoButtonClickHandler(id)}
              >
                {`C/O ${id}`}
              </button>
            </li>
          ))}
        </ol>
        <button
          className={cx("actionButton")}
          onClick={handleActionButtonClick}
        >
          Get Diff
        </button>
      </div>
      <div className={cx("thresholdWrapper")}>
        <p>{`threshold: ${threshold}`}</p>
        <input
          className={cx("threshold")}
          type="range"
          value={threshold}
          onChange={handleRangeInputChange}
          min={0}
          max={1}
          step={0.01}
        />
      </div>
      <div className={cx("imageCards")}>
        <ImageCard
          ref={prevImgRef}
          label="Previous"
          imageUrl={getImageUrl(ImageLabels.previous)}
        />
        <ImageCard
          ref={currentImgRef}
          label="Current"
          imageUrl={getImageUrl(ImageLabels.current)}
        />
      </div>
      <hr />
      <div className={cx("diffVisualizer")}>
        {isLoading ? <Loading /> : <DiffVisualizer ref={diffCanvasRef} />}
      </div>
    </div>
  );
};

export default App;
