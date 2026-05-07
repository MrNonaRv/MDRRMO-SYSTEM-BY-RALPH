import React from "react";
import { LUND_BROWDER_AGE_MAP, LUND_BROWDER_REGIONS } from "../constants";

interface BodyMapProps {
  selectedRegions: string[];
  onToggleRegion: (regionId: string) => void;
  age: string;
  type: "adult" | "infant";
}

const BodyPart = ({
  id,
  d,
  label,
  percentage,
  isSelected,
  onClick,
}: {
  id: string;
  d: string;
  label: string;
  percentage: number;
  isSelected: boolean;
  onClick: () => void;
}) => (
  <g onClick={onClick} className="cursor-pointer group">
    <path
      d={d}
      className={`transition-all duration-300 ${
        isSelected
          ? "fill-red-500 stroke-red-700 stroke-[1.5px]"
          : "fill-slate-100 dark:fill-slate-700/50 stroke-slate-400 dark:stroke-slate-500 group-hover:fill-red-100 dark:group-hover:fill-red-900/30 group-hover:stroke-red-400"
      }`}
    />
    <title>{`${label} (${percentage}%)`}</title>
  </g>
);

export const BodyMap: React.FC<BodyMapProps> = ({
  selectedRegions,
  onToggleRegion,
  age,
  type,
}) => {
  const getAgeKey = () => {
    if (type === "adult") return "adult";
    const a = parseInt(age);
    if (isNaN(a)) return 0;
    if (a >= 15) return 15;
    if (a >= 10) return 10;
    if (a >= 5) return 5;
    if (a >= 1) return 1;
    return 0;
  };

  const ageKey = getAgeKey() as keyof typeof LUND_BROWDER_AGE_MAP;
  const dynamicValues = LUND_BROWDER_AGE_MAP[ageKey];

  const getPercentage = (region: (typeof LUND_BROWDER_REGIONS)[0]) => {
    if (region.percentage) return region.percentage;
    if (region.type === "A") return dynamicValues.head;
    if (region.type === "B") return dynamicValues.thigh;
    if (region.type === "C") return dynamicValues.leg;
    return 0;
  };

  const renderModel = (isChild: boolean, isBack: boolean) => {
    const headScale = isChild ? 1.3 : 1;
    const legScale = isChild ? 0.7 : 1;

    return (
      <svg viewBox="0 0 100 200" className="w-full max-w-[150px] h-auto drop-shadow-sm">
        {/* Head (A) */}
        <BodyPart
          id={isBack ? "head-b" : "head-f"}
          label={isBack ? "Head Back" : "Head Front"}
          percentage={dynamicValues.head}
          isSelected={selectedRegions.includes(isBack ? "head-b" : "head-f")}
          onClick={() => onToggleRegion(isBack ? "head-b" : "head-f")}
          d={`M50,${18 - (headScale - 1) * 8} 
              C${58 + headScale * 2},${18 - (headScale - 1) * 8} 
               ${62 + headScale * 2},${26 + headScale * 6} 
               ${60 + headScale * 2},${35 + headScale * 8}
              C${58 + headScale * 2},${44 + headScale * 10} 
               ${54},${46 + headScale * 10} 
               50,${46 + headScale * 10}
              C${46},${46 + headScale * 10} 
               ${42 - headScale * 2},${44 + headScale * 10} 
               ${40 - headScale * 2},${35 + headScale * 8}
              C${38 - headScale * 2},${26 + headScale * 6} 
               ${42 - headScale * 2},${18 - (headScale - 1) * 8} 
               50,${18 - (headScale - 1) * 8} Z`}
        />

        {/* Neck */}
        <BodyPart
          id={isBack ? "neck-b" : "neck-f"}
          label="Neck"
          percentage={1}
          isSelected={selectedRegions.includes(isBack ? "neck-b" : "neck-f")}
          onClick={() => onToggleRegion(isBack ? "neck-b" : "neck-f")}
          d={`M44,${46 + headScale * 10} L56,${46 + headScale * 10} L54,${54 + headScale * 8} L46,${54 + headScale * 8} Z`}
        />

        {/* Torso */}
        <BodyPart
          id={isBack ? "torso-b" : "torso-f"}
          label={isBack ? "Back" : "Torso Front"}
          percentage={13}
          isSelected={selectedRegions.includes(isBack ? "torso-b" : "torso-f")}
          onClick={() => onToggleRegion(isBack ? "torso-b" : "torso-f")}
          d={`M34,${54 + headScale * 8} L66,${54 + headScale * 8} L68,${100 + headScale * 6} L32,${100 + headScale * 6} Z`}
        />

        {/* LEFT Upper Arm (appears on right side of figure) */}
        <BodyPart
          id={isBack ? "uarm-lb" : "uarm-lf"}
          label="L Upper Arm"
          percentage={2}
          isSelected={selectedRegions.includes(isBack ? "uarm-lb" : "uarm-lf")}
          onClick={() => onToggleRegion(isBack ? "uarm-lb" : "uarm-lf")}
          d={`M${67},${56 + headScale * 8} L${80},${58 + headScale * 8} L${78},${85 + headScale * 6} L${65},${83 + headScale * 6} Z`}
        />

        {/* RIGHT Upper Arm */}
        <BodyPart
          id={isBack ? "uarm-rb" : "uarm-rf"}
          label="R Upper Arm"
          percentage={2}
          isSelected={selectedRegions.includes(isBack ? "uarm-rb" : "uarm-rf")}
          onClick={() => onToggleRegion(isBack ? "uarm-rb" : "uarm-rf")}
          d={`M${33},${56 + headScale * 8} L${20},${58 + headScale * 8} L${22},${85 + headScale * 6} L${35},${83 + headScale * 6} Z`}
        />

        {/* LEFT Forearm */}
        <BodyPart
          id={isBack ? "larm-lb" : "larm-lf"}
          label="L Forearm"
          percentage={1.5}
          isSelected={selectedRegions.includes(isBack ? "larm-lb" : "larm-lf")}
          onClick={() => onToggleRegion(isBack ? "larm-lb" : "larm-lf")}
          d={`M${78},${85 + headScale * 6} L${83},${87 + headScale * 6} L${81},${110 + headScale * 4} L${76},${108 + headScale * 4} Z`}
        />

        {/* RIGHT Forearm */}
        <BodyPart
          id={isBack ? "larm-rb" : "larm-rf"}
          label="R Forearm"
          percentage={1.5}
          isSelected={selectedRegions.includes(isBack ? "larm-rb" : "larm-rf")}
          onClick={() => onToggleRegion(isBack ? "larm-rb" : "larm-rf")}
          d={`M${22},${85 + headScale * 6} L${17},${87 + headScale * 6} L${19},${110 + headScale * 4} L${24},${108 + headScale * 4} Z`}
        />

        {/* LEFT Hand */}
        <BodyPart
          id={isBack ? "hand-lb" : "hand-lf"}
          label="L Hand"
          percentage={1.25}
          isSelected={selectedRegions.includes(isBack ? "hand-lb" : "hand-lf")}
          onClick={() => onToggleRegion(isBack ? "hand-lb" : "hand-lf")}
          d={`M${76},${108 + headScale * 4} L${84},${108 + headScale * 4} L${85},${118 + headScale * 4} L${75},${118 + headScale * 4} Z`}
        />

        {/* RIGHT Hand */}
        <BodyPart
          id={isBack ? "hand-rb" : "hand-rf"}
          label="R Hand"
          percentage={1.25}
          isSelected={selectedRegions.includes(isBack ? "hand-rb" : "hand-rf")}
          onClick={() => onToggleRegion(isBack ? "hand-rb" : "hand-rf")}
          d={`M${24},${108 + headScale * 4} L${16},${108 + headScale * 4} L${15},${118 + headScale * 4} L${25},${118 + headScale * 4} Z`}
        />

        {/* Lower body — front vs back differences */}
        {!isBack ? (
          <>
            {/* Genitals / Groin (front only) */}
            <BodyPart
              id="genitals"
              label="Genitals"
              percentage={1}
              isSelected={selectedRegions.includes("genitals")}
              onClick={() => onToggleRegion("genitals")}
              d={`M44,${100 + headScale * 6} L56,${100 + headScale * 6} L54,${108 + headScale * 6} L46,${108 + headScale * 6} Z`}
            />
            {/* LEFT Thigh (B) — front */}
            <BodyPart
              id="thigh-lf"
              label="L Thigh"
              percentage={dynamicValues.thigh}
              isSelected={selectedRegions.includes("thigh-lf")}
              onClick={() => onToggleRegion("thigh-lf")}
              d={`M${52},${108 + headScale * 6} L${66},${106 + headScale * 6} L${65},${145 + headScale * 4 * legScale} L${51},${147 + headScale * 4 * legScale} Z`}
            />
            {/* RIGHT Thigh (B) — front */}
            <BodyPart
              id="thigh-rf"
              label="R Thigh"
              percentage={dynamicValues.thigh}
              isSelected={selectedRegions.includes("thigh-rf")}
              onClick={() => onToggleRegion("thigh-rf")}
              d={`M${48},${108 + headScale * 6} L${34},${106 + headScale * 6} L${35},${145 + headScale * 4 * legScale} L${49},${147 + headScale * 4 * legScale} Z`}
            />
            {/* LEFT Lower Leg (C) — front */}
            <BodyPart
              id="leg-lf"
              label="L Lower Leg"
              percentage={dynamicValues.leg}
              isSelected={selectedRegions.includes("leg-lf")}
              onClick={() => onToggleRegion("leg-lf")}
              d={`M${51},${149 + headScale * 4 * legScale} L${64},${147 + headScale * 4 * legScale} L${63},${178 + legScale * 6} L${50},${180 + legScale * 6} Z`}
            />
            {/* RIGHT Lower Leg (C) — front */}
            <BodyPart
              id="leg-rf"
              label="R Lower Leg"
              percentage={dynamicValues.leg}
              isSelected={selectedRegions.includes("leg-rf")}
              onClick={() => onToggleRegion("leg-rf")}
              d={`M${49},${149 + headScale * 4 * legScale} L${36},${147 + headScale * 4 * legScale} L${37},${178 + legScale * 6} L${50},${180 + legScale * 6} Z`}
            />
            {/* LEFT Foot — front */}
            <BodyPart
              id="foot-lf"
              label="L Foot"
              percentage={1.75}
              isSelected={selectedRegions.includes("foot-lf")}
              onClick={() => onToggleRegion("foot-lf")}
              d={`M${50},${182 + legScale * 6} L${65},${180 + legScale * 6} L${67},${190 + legScale * 4} L${50},${192 + legScale * 4} Z`}
            />
            {/* RIGHT Foot — front */}
            <BodyPart
              id="foot-rf"
              label="R Foot"
              percentage={1.75}
              isSelected={selectedRegions.includes("foot-rf")}
              onClick={() => onToggleRegion("foot-rf")}
              d={`M${50},${182 + legScale * 6} L${35},${180 + legScale * 6} L${33},${190 + legScale * 4} L${50},${192 + legScale * 4} Z`}
            />
          </>
        ) : (
          <>
            {/* LEFT Buttock (back only) */}
            <BodyPart
              id="buttock-l"
              label="L Buttock"
              percentage={2.5}
              isSelected={selectedRegions.includes("buttock-l")}
              onClick={() => onToggleRegion("buttock-l")}
              d={`M${52},${100 + headScale * 6} L${66},${98 + headScale * 6} L${66},${114 + headScale * 5} L${52},${116 + headScale * 5} Z`}
            />
            {/* RIGHT Buttock (back only) */}
            <BodyPart
              id="buttock-r"
              label="R Buttock"
              percentage={2.5}
              isSelected={selectedRegions.includes("buttock-r")}
              onClick={() => onToggleRegion("buttock-r")}
              d={`M${48},${100 + headScale * 6} L${34},${98 + headScale * 6} L${34},${114 + headScale * 5} L${48},${116 + headScale * 5} Z`}
            />
            {/* LEFT Thigh (B) — back */}
            <BodyPart
              id="thigh-lb"
              label="L Thigh"
              percentage={dynamicValues.thigh}
              isSelected={selectedRegions.includes("thigh-lb")}
              onClick={() => onToggleRegion("thigh-lb")}
              d={`M${52},${116 + headScale * 5} L${66},${114 + headScale * 5} L${65},${150 + headScale * 4 * legScale} L${51},${152 + headScale * 4 * legScale} Z`}
            />
            {/* RIGHT Thigh (B) — back */}
            <BodyPart
              id="thigh-rb"
              label="R Thigh"
              percentage={dynamicValues.thigh}
              isSelected={selectedRegions.includes("thigh-rb")}
              onClick={() => onToggleRegion("thigh-rb")}
              d={`M${48},${116 + headScale * 5} L${34},${114 + headScale * 5} L${35},${150 + headScale * 4 * legScale} L${49},${152 + headScale * 4 * legScale} Z`}
            />
            {/* LEFT Lower Leg (C) — back */}
            <BodyPart
              id="leg-lb"
              label="L Lower Leg"
              percentage={dynamicValues.leg}
              isSelected={selectedRegions.includes("leg-lb")}
              onClick={() => onToggleRegion("leg-lb")}
              d={`M${51},${154 + headScale * 4 * legScale} L${64},${152 + headScale * 4 * legScale} L${63},${178 + legScale * 6} L${50},${180 + legScale * 6} Z`}
            />
            {/* RIGHT Lower Leg (C) — back */}
            <BodyPart
              id="leg-rb"
              label="R Lower Leg"
              percentage={dynamicValues.leg}
              isSelected={selectedRegions.includes("leg-rb")}
              onClick={() => onToggleRegion("leg-rb")}
              d={`M${49},${154 + headScale * 4 * legScale} L${36},${152 + headScale * 4 * legScale} L${37},${178 + legScale * 6} L${50},${180 + legScale * 6} Z`}
            />
            {/* LEFT Foot — back */}
            <BodyPart
              id="foot-lb"
              label="L Foot"
              percentage={1.75}
              isSelected={selectedRegions.includes("foot-lb")}
              onClick={() => onToggleRegion("foot-lb")}
              d={`M${50},${182 + legScale * 6} L${65},${180 + legScale * 6} L${67},${190 + legScale * 4} L${50},${192 + legScale * 4} Z`}
            />
            {/* RIGHT Foot — back */}
            <BodyPart
              id="foot-rb"
              label="R Foot"
              percentage={1.75}
              isSelected={selectedRegions.includes("foot-rb")}
              onClick={() => onToggleRegion("foot-rb")}
              d={`M${50},${182 + legScale * 6} L${35},${180 + legScale * 6} L${33},${190 + legScale * 4} L${50},${192 + legScale * 4} Z`}
            />
          </>
        )}
      </svg>
    );
  };

  return (
    <div className="space-y-6">
      {/* Figures */}
      <div className="flex flex-col sm:flex-row gap-8 justify-center items-start">
        {/* Front */}
        <div className="flex flex-col items-center gap-3">
          <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest border-b-2 border-[#c0392b] pb-1 px-2">
            Front View
          </span>
          <div className="bg-slate-50 dark:bg-slate-900/60 shadow-inner rounded-3xl p-5 border border-slate-100 dark:border-slate-800">
            {renderModel(type === "infant", false)}
          </div>
        </div>

        {/* Back */}
        <div className="flex flex-col items-center gap-3">
          <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest border-b-2 border-slate-400 pb-1 px-2">
            Back View
          </span>
          <div className="bg-slate-50 dark:bg-slate-900/60 shadow-inner rounded-3xl p-5 border border-slate-100 dark:border-slate-800">
            {renderModel(type === "infant", true)}
          </div>
        </div>
      </div>

      {/* Age-Specific Legend Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-1.5 h-6 bg-[#c0392b] rounded-full shrink-0" />
          <h4 className="text-[11px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">
            Lund-Browder Reference — Age: {ageKey === "adult" ? "Adult" : ageKey}
          </h4>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-5">
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700 text-center">
            <div className="text-[9px] font-black text-slate-400 uppercase mb-2 leading-tight">
              A = ½ of Head
            </div>
            <div className="text-xl font-black text-[#c0392b]">{dynamicValues.head}%</div>
          </div>
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700 text-center">
            <div className="text-[9px] font-black text-slate-400 uppercase mb-2 leading-tight">
              B = ½ of One Thigh
            </div>
            <div className="text-xl font-black text-[#c0392b]">{dynamicValues.thigh}%</div>
          </div>
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700 text-center">
            <div className="text-[9px] font-black text-slate-400 uppercase mb-2 leading-tight">
              C = ½ of Lower Leg
            </div>
            <div className="text-xl font-black text-[#c0392b]">{dynamicValues.leg}%</div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {[
            ["Neck",     "1%"],
            ["Torso",   "13%"],
            ["U-Arm",    "2%"],
            ["Forearm", "1.5%"],
            ["Hand",   "1.25%"],
            ["Genitals", "1%"],
            ["Buttock", "2.5%"],
            ["Foot",   "1.75%"],
          ].map(([l, v]) => (
            <div
              key={l}
              className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
            >
              <span className="text-[9px] font-black text-slate-500 uppercase">{l}</span>
              <span className="text-[10px] font-black text-[#c0392b]">{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
