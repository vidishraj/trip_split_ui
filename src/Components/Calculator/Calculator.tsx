import React, { useState, useEffect, useRef, MouseEvent } from "react";
import Wrapper from "./Wrapper";
import Screen from "./Screen";
import ButtonBox from "./ButtonBox";
import Button from "./Button";

const btnValues = [
  ["C", "+-", "%", "/"],
  [7, 8, 9, "X"],
  [4, 5, 6, "-"],
  [1, 2, 3, "+"],
  [0, ".", "="],
];

interface CalcState {
  sign: string;
  num: number | string;
  res: number | string;
}

interface CalculatorProps {
  isVisible: boolean;
  onClose: () => void;
}

const toLocaleString = (num: number | string): string =>
  String(num).replace(/(?<!\..*)(\d)(?=(?:\d{3})+(?:\.|$))/g, "$1 ");

const removeSpaces:any  = (num: string | number): string =>
  num.toString().replace(/\s/g, "");

const math = (a: number, b: number, sign: string): number =>
  sign === "+"
    ? a + b
    : sign === "-"
      ? a - b
      : sign === "X"
        ? a * b
        : a / b;

const zeroDivisionError = "Can't divide with 0";

const Calculator: React.FC<CalculatorProps> = ({ isVisible, onClose }) => {
  const [calc, setCalc] = useState<CalcState>({ sign: "", num: 0, res: 0 });
  const calculatorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isVisible && calculatorRef.current) {
      calculatorRef.current.style.zIndex = "9999";
    }
  }, [isVisible]);

  const resetClickHandler = () => {
    setCalc({ sign: "", num: 0, res: 0 });
  };

  const numClickHandler = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const value = e.currentTarget.innerHTML;

    if (removeSpaces(calc.num).length < 16) {
      const newNum: any =
        removeSpaces(calc.num) % 1 === 0 && !calc.num.toString().includes(".")
          ? toLocaleString(Number(removeSpaces(calc.num + value)))
          : toLocaleString(calc.num + value);

      setCalc({
        ...calc,
        num: newNum,
        res: !calc.sign ? 0 : calc.res,
      });
    }
  };

  const comaClickHandler = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const value = e.currentTarget.innerHTML;

    setCalc({
      ...calc,
      num: !calc.num.toString().includes(".") ? calc.num + value : calc.num,
    });
  };

  const signClickHandler = (e: MouseEvent<HTMLButtonElement>) => {
    const newSign = e.currentTarget.innerHTML;

    setCalc({
      ...calc,
      sign: newSign,
      res: !calc.num
        ? calc.res
        : !calc.res
          ? calc.num
          : toLocaleString(
            math(
              Number(removeSpaces(calc.res)),
              Number(removeSpaces(calc.num)),
              calc.sign
            )
          ),
      num: 0,
    });
  };

  const equalsClickHandler = () => {
    if (calc.sign && calc.num) {
      setCalc({
        ...calc,
        res:
          calc.num === "0" && calc.sign === "/"
            ? zeroDivisionError
            : toLocaleString(
              math(
                Number(removeSpaces(calc.res)),
                Number(removeSpaces(calc.num)),
                calc.sign
              )
            ),
        sign: "",
        num: 0,
      });
    }
  };

  const invertClickHandler = () => {
    setCalc({
      ...calc,
      num: calc.num
        ? toLocaleString(Number(removeSpaces(calc.num)) * -1)
        : 0,
      res: calc.res
        ? toLocaleString(Number(removeSpaces(calc.res)) * -1)
        : 0,
      sign: "",
    });
  };

  const percentClickHandler = () => {
    let num = calc.num ? parseFloat(removeSpaces(calc.num)) : 0;
    let res = calc.res ? parseFloat(removeSpaces(calc.res)) : 0;
    setCalc({
      ...calc,
      num: num / 100,
      res: res / 100,
      sign: "",
    });
  };

  const buttonClickHandler = (
    e: MouseEvent<HTMLButtonElement>,
    btn: string | number
  ) => {
    if (btn === "C" || calc.res === zeroDivisionError) {
      resetClickHandler();
    } else if (btn === "+-") {
      invertClickHandler();
    } else if (btn === "%") {
      percentClickHandler();
    } else if (btn === "=") {
      equalsClickHandler();
    } else if (["/", "X", "-", "+"].includes(btn.toString())) {
      signClickHandler(e);
    } else if (btn === ".") {
      comaClickHandler(e);
    } else {
      numClickHandler(e);
    }
  };

  return (
    <div
      ref={calculatorRef}
      style={{
        position: "absolute",
        top: 150,
        right:0,
        display: isVisible ? "flex" : "none",
        justifyContent: "flex-end",
        zIndex: 9999,
        flexGrow: 1,
        padding: "0.5rem",
      }}
    >
      {/*<div style={{ textAlign: "right" }}>*/}
      {/*  <button*/}
      {/*    onClick={onClose}*/}
      {/*    style={{*/}
      {/*      background: "transparent",*/}
      {/*      border: "none",*/}
      {/*      color: "#fff",*/}
      {/*      fontSize: "1.2rem",*/}
      {/*      cursor: "pointer",*/}
      {/*    }}*/}
      {/*  >*/}
      {/*    ✖*/}
      {/*  </button>*/}
      {/*</div>*/}
      <Wrapper>
        <Screen value={calc.num ? calc.num : calc.res} />
        <ButtonBox>
          {btnValues.flat().map((btn, i) => (
            <Button
              key={i}
              className={btn === "=" ? "equals" : ""}
              value={btn}
              onClick={(e: any) => buttonClickHandler(e, btn)}
            />
          ))}
        </ButtonBox>
      </Wrapper>
    </div>
  );
};

export default Calculator;
