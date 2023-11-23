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
import DiffVisualizer from "../DiffVisualizer";
import Empty from "../Empty";

const cx = classNames.bind(styles);

const App = () => {
  // kenny: CameraOrientation -> co
  const [currentCoId, setCurrentCoId] = useState(CAMERA_ORIENTATION_IDS[0]);
  const [threshold, setThreshold] = useState(0.15);
  const [isEmpty, setIsEmpty] = useState(true);
  const [imgCtx, setImgCtx] = useState<CanvasRenderingContext2D>();

  const prevImgRef = useRef<HTMLImageElement>(null);
  const currentImgRef = useRef<HTMLImageElement>(null);
  const diffCanvasRef = useRef<HTMLCanvasElement>(null);

  const getImageUrl = (label: ImageLabels) => {
    return `/snapshot-diff/assets/images/co${currentCoId}-${label}.png`;
  };

  const adjustCanvasSize = (canvas: HTMLCanvasElement) => {
    canvas.width = IMAGE_SIZES.to.width;
    canvas.height = IMAGE_SIZES.to.height;
  };

  const getImageData = (
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement
  ) => {
    // prettier-ignore
    ctx.drawImage(img, 0, 0, IMAGE_SIZES.from.width, IMAGE_SIZES.from.height, 0, 0, IMAGE_SIZES.to.width, IMAGE_SIZES.to.height);

    return ctx.getImageData(0, 0, IMAGE_SIZES.to.width, IMAGE_SIZES.to.height);
  };

  useEffect(() => {
    if (!imgCtx) {
      const canvas = document.createElement("canvas");
      adjustCanvasSize(canvas);
      const context = canvas.getContext("2d");
      if (!context) return;

      setImgCtx(context);
    }
  }, [imgCtx]);

  useEffect(() => {
    if (diffCanvasRef.current) {
      adjustCanvasSize(diffCanvasRef.current);
    }
  }, []);

  const createCoButtonClickHandler = (id: number) => () => {
    setCurrentCoId(id);
  };

  const handleActionButtonClick = () => {
    if (!prevImgRef.current || !currentImgRef.current || !diffCanvasRef.current)
      return;
    if (!imgCtx) return;

    const prevImg = prevImgRef.current;
    const prevImageData = getImageData(imgCtx, prevImg);

    const currentImg = currentImgRef.current;
    const currentImageData = getImageData(imgCtx, currentImg);

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
      { threshold, diffColor: [216, 0, 50], diffColorAlt: [7, 102, 173] }
    );
    diffCtx.putImageData(diff, 0, 0);

    setIsEmpty(false);
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
          labelColor="red"
          imageUrl={getImageUrl(ImageLabels.previous)}
        />
        <ImageCard
          ref={currentImgRef}
          label="Current"
          labelColor="blue"
          imageUrl={getImageUrl(ImageLabels.current)}
        />
      </div>
      <hr />
      <div className={cx("diffVisualizer")}>
        {isEmpty && (
          <div className={cx("empty")}>
            <Empty />
          </div>
        )}
        <DiffVisualizer ref={diffCanvasRef} />
      </div>
    </div>
  );
};

export default App;
