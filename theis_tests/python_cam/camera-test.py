import cv2
from flask import Flask, Response
from ultralytics import YOLO

app = Flask(__name__)
model = YOLO("yolo11n.pt")


def generate_frames():
    cap = cv2.VideoCapture(0)
    while True:
        success, frame = cap.read()
        if not success:
            break
        frame = cv2.resize(frame, (640, 480))
        results = model(frame)

        for result in results:
            boxes = result.boxes
            for box in boxes:
                x1, y1, x2, y2 = map(int, box.xyxy[0])
                label = int(box.cls)
                confidence = float(box.conf)

                frame = cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
                frame = cv2.putText(
                    frame,
                    f"{model.names[int(label)]} {confidence:.2f}",
                    (x1, y1 - 10),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.5,
                    (255, 0, 0),
                    2,
                )

        ret, buffer = cv2.imencode(".jpg", frame)
        frame = buffer.tobytes()
        yield (b"--frame\r\n" b"Content-Type: image/jpeg\r\n\r\n" + frame + b"\r\n")


@app.route("/video_feed")
def video_feed():
    return Response(
        generate_frames(), mimetype="multipart/x-mixed-replace; boundary=frame"
    )


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000)
