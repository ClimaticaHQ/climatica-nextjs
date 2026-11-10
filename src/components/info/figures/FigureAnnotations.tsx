import { layoutAnnotations } from "@/utils/infoFigure.util";
import { ANNOTATION_STYLE as S } from "../info.constant";
import type { TAnnotationNumberProps, TFigureAnnotationsProps } from "../info.type";

const line = { stroke: S.STROKE, strokeWidth: S.STROKE_WIDTH, fill: "none" } as const;

/**
 * A figure's annotations drawn in its chart: numbers in the band above the plot (a bottom
 * span's under the month labels), thin brackets over spans, dashed leaders down to rings at
 * points. Numbered by the caption. The 0 °C line is the standard chart's own.
 */
export function FigureAnnotations({ annotations, projection, layout }: TFigureAnnotationsProps) {
  const { numbers, brackets, leaders } = layoutAnnotations({ annotations, projection, layout });
  const tick = layout.bracketTick;

  return (
    <g>
      {brackets.map(({ number, months, x1, x2, y, tickDirection }) => (
        <path
          key={`${number}-${months.join(",")}`}
          {...line}
          d={`M${x1},${y + tickDirection * tick}V${y}H${x2}V${y + tickDirection * tick}`}
          data-annotation-bracket={number}
          data-months={months.join(",")}
        />
      ))}
      {leaders.map(({ number, x1, y1, x2, y2 }) => (
        <g key={number} data-annotation-leader={number}>
          <line {...line} x1={x1} y1={y1} x2={x2} y2={y2} strokeDasharray={S.LEADER_DASH} />
          <circle {...line} cx={x2} cy={y2} r={S.RING_RADIUS} />
        </g>
      ))}
      {numbers.map((props) => (
        <AnnotationNumber key={props.number} {...props} layout={layout} />
      ))}
    </g>
  );
}

function AnnotationNumber({ number, x, y, layout }: TAnnotationNumberProps) {
  return (
    <g data-annotation-number={number}>
      <circle
        cx={x}
        cy={y}
        r={layout.numberRadius}
        fill={S.NUMBER_FILL}
        stroke={S.NUMBER_RING}
        strokeWidth={S.NUMBER_RING_WIDTH}
      />
      <text
        x={x}
        y={y}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={layout.numberFontSize}
        fontWeight={S.NUMBER_FONT_WEIGHT}
        fill={S.NUMBER_TEXT}
      >
        {number}
      </text>
    </g>
  );
}
