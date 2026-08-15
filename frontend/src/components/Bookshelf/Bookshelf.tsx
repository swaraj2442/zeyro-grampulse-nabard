"use client";

import Shelf3D from "./Shelf3D";
import { allBooksData } from "@/data/bookshelfData";
import { Globe, Plant, AlarmClock, CoffeeMug, Hourglass, NewtonCradle, RubiksCube, Sculpture, CrystalBall } from "./ShelfDecor";

export default function Bookshelf({ onSelect }: { onSelect?: (id: string) => void }) {
  return (
    <div className="mx-auto flex max-w-[90rem] flex-col gap-20 w-full pt-10">
      <Shelf3D 
        books={allBooksData} 
        delay={0} 
        onSelect={onSelect} 
        leftDecor={<Globe />}
        // rightDecor={<RubiksCube />}
        decorations={{
          // 0: <CoffeeMug />,
          // 1: <Hourglass />,
          // 3: <Sculpture />,
          // 5: <NewtonCradle />,
          // 7: <CrystalBall />,
          // 9: <AlarmClock />,
          10: <Plant />
        }}
      />
    </div>
  );
}
