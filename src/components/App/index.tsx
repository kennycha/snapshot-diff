import pixelmatch from "pixelmatch";
import classNames from "classnames/bind";
import styles from "./index.module.scss";
import {
  CAMERA_ORIENTATION_IDS,
  DEFAULT_IMAGE_SIZE,
  ImageLabels,
} from "../../constants";
import ImageCard from "../ImageCard";
import { useEffect, useRef, useState } from "react";
import Loading from "../Loading";
import DiffVisualizer from "../DiffVisualizer";

const cx = classNames.bind(styles);

const App = () => {
  // kenny: CameraOrientation -> co
  const [currentCoId, setCurrentCoId] = useState(CAMERA_ORIENTATION_IDS[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [prevCtx, setPrevCtx] = useState<CanvasRenderingContext2D>();
  const [currentCtx, setCurrentCtx] = useState<CanvasRenderingContext2D>();

  const prevImgRef = useRef<HTMLImageElement>(null);
  const currentImgRef = useRef<HTMLImageElement>(null);
  const diffCanvasRef = useRef<HTMLCanvasElement>(null);

  const getImageUrl = (label: ImageLabels) => {
    return `/assets/images/co${currentCoId}-${label}.png`;
  };

  useEffect(() => {
    if (!prevCtx) {
      const canvas = document.createElement("canvas");
      canvas.width = DEFAULT_IMAGE_SIZE.width;
      canvas.height = DEFAULT_IMAGE_SIZE.height;
      const context = canvas.getContext("2d");
      if (!context) return;

      setPrevCtx(context);
    }
  }, [prevCtx]);

  useEffect(() => {
    if (!currentCtx) {
      const canvas = document.createElement("canvas");
      canvas.width = DEFAULT_IMAGE_SIZE.width;
      canvas.height = DEFAULT_IMAGE_SIZE.height;
      const context = canvas.getContext("2d");
      if (!context) return;

      setCurrentCtx(context);
    }
  }, [currentCtx]);

  const createCoButtonClickHandler = (id: number) => () => {
    setCurrentCoId(id);
  };

  const handleActionButtonClick = () => {
    if (!prevImgRef.current || !currentImgRef.current || !diffCanvasRef.current)
      return;
    if (!prevCtx || !currentCtx) return;

    const prevImg = prevImgRef.current;
    prevCtx.drawImage(prevImg, 0, 0);
    const prevImageData = prevCtx.getImageData(
      0,
      0,
      DEFAULT_IMAGE_SIZE.width,
      DEFAULT_IMAGE_SIZE.height
    );

    const currentImg = currentImgRef.current;
    currentCtx.drawImage(currentImg, 0, 0);
    const currentImageData = currentCtx.getImageData(
      0,
      0,
      DEFAULT_IMAGE_SIZE.width,
      DEFAULT_IMAGE_SIZE.height
    );

    const diffCtx = diffCanvasRef.current.getContext("2d");
    if (!diffCtx) return;

    const diff = diffCtx.createImageData(
      DEFAULT_IMAGE_SIZE.width,
      DEFAULT_IMAGE_SIZE.height
    );
    pixelmatch(
      prevImageData.data,
      currentImageData.data,
      diff.data,
      DEFAULT_IMAGE_SIZE.width,
      DEFAULT_IMAGE_SIZE.height,
      { threshold: 0.05, diffColor: [216, 0, 50] }
    );
    diffCtx.putImageData(diff, 0, 0);
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
