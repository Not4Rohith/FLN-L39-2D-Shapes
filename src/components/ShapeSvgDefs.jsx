import React from 'react';

/**
 * ShapeSvgDefs renders the 52 symbols from shape-svgs.html
 * into the DOM so that <svg class="col"><use href="#id" /></svg> works everywhere.
 */
export default function ShapeSvgDefs() {
  return (
    <svg
      width="0"
      height="0"
      style={{ position: 'absolute', width: 0, height: 0, pointerEvents: 'none', overflow: 'hidden' }}
      aria-hidden="true"
    >
      <defs>
        {/* CIRCLES */}
        <symbol id="coin" viewBox="0 0 120 120">
          <circle className="a" cx="60" cy="60" r="48"/>
          <circle className="k" cx="60" cy="60" r="37"/>
          <path className="k" d="M60 40l6 13 14 2-10 10 3 14-13-7-13 7 3-14-10-10 14-2z"/>
        </symbol>
        <symbol id="clock" viewBox="0 0 120 120">
          <circle className="f" cx="60" cy="60" r="48"/>
          <path className="k" d="M60 17v9M60 94v9M17 60h9M94 60h9M60 60V34M60 60l17 10"/>
          <circle className="z" cx="60" cy="60" r="3.5"/>
        </symbol>
        <symbol id="biscuit" viewBox="0 0 120 120">
          <circle className="j" cx="60" cy="60" r="48"/>
          <circle className="g" cx="44" cy="42" r="3.5"/>
          <circle className="g" cx="76" cy="44" r="3.5"/>
          <circle className="g" cx="60" cy="62" r="3.5"/>
          <circle className="g" cx="40" cy="74" r="3.5"/>
          <circle className="g" cx="80" cy="76" r="3.5"/>
          <circle className="g" cx="60" cy="88" r="3.5"/>
        </symbol>
        <symbol id="button" viewBox="0 0 120 120">
          <circle className="e" cx="60" cy="60" r="48"/>
          <circle className="k" cx="60" cy="60" r="36"/>
          <circle className="f" cx="52" cy="52" r="4"/>
          <circle className="f" cx="68" cy="52" r="4"/>
          <circle className="f" cx="52" cy="68" r="4"/>
          <circle className="f" cx="68" cy="68" r="4"/>
          <path className="k" d="M52 52L68 68M68 52L52 68"/>
        </symbol>
        <symbol id="plate" viewBox="0 0 120 120">
          <circle className="w" cx="60" cy="60" r="48"/>
          <circle className="k" cx="60" cy="60" r="34"/>
        </symbol>
        <symbol id="pizza" viewBox="0 0 120 120">
          <circle className="j" cx="60" cy="60" r="48"/>
          <circle className="a" cx="60" cy="60" r="40"/>
          <path className="k" d="M60 20v80M20 60h80M32 32l56 56M88 32L32 88"/>
          <circle className="c" cx="46" cy="44" r="7"/>
          <circle className="c" cx="76" cy="48" r="7"/>
          <circle className="c" cx="50" cy="76" r="7"/>
          <circle className="c" cx="80" cy="78" r="7"/>
        </symbol>
        <symbol id="wheel" viewBox="0 0 120 120">
          <circle className="z" cx="60" cy="60" r="48"/>
          <circle className="h" cx="60" cy="60" r="30"/>
          <circle className="w" cx="60" cy="60" r="8"/>
          <path className="k" d="M60 52V30M60 68v22M52 60H30M68 60h22M54 54L38 38M66 54l16-16M54 66L38 82M66 66l16 16"/>
        </symbol>
        <symbol id="donut" viewBox="0 0 120 120">
          <circle className="i" cx="60" cy="60" r="48"/>
          <circle className="w" cx="60" cy="60" r="16"/>
          <path className="k" d="M36 40l7-4M78 36l6 5M86 68l-7 4M38 82l6-5M58 24v8M62 96v-8"/>
        </symbol>
        <symbol id="ball" viewBox="0 0 120 120">
          <circle className="w" cx="60" cy="60" r="48"/>
          <path className="k" d="M75 55l27-9M69 72l17 26M51 72L34 98M45 55L18 46M60 44V13"/>
          <path className="z" d="M60 44l15 11-6 17H51l-6-17z"/>
        </symbol>

        {/* RECTANGLES */}
        <symbol id="laptop" viewBox="0 0 120 120">
          <rect className="h" x="20" y="18" width="80" height="60" rx="6"/>
          <rect className="e" x="27" y="25" width="66" height="46" rx="2"/>
          <path className="h" d="M6 78H114L108 98H12z"/>
        </symbol>
        <symbol id="window" viewBox="0 0 120 120">
          <rect className="g" x="16" y="12" width="88" height="96" rx="3"/>
          <rect className="e" x="24" y="20" width="34" height="38"/>
          <rect className="e" x="62" y="20" width="34" height="38"/>
          <rect className="e" x="24" y="62" width="34" height="38"/>
          <rect className="e" x="62" y="62" width="34" height="38"/>
        </symbol>
        <symbol id="mirror" viewBox="0 0 120 120">
          <rect className="g" x="28" y="8" width="64" height="104" rx="8"/>
          <rect className="l" x="35" y="15" width="50" height="90" rx="4"/>
          <path className="k" d="M44 52L70 26M44 82L82 44"/>
        </symbol>
        <symbol id="wall" viewBox="0 0 120 120">
          <rect className="c" x="8" y="16" width="104" height="88" rx="3"/>
          <path className="k" d="M8 38h104M8 60h104M8 82h104M40 16v22M76 16v22M22 38v22M58 38v22M94 38v22M40 60v22M76 60v22M22 82v22M58 82v22M94 82v22"/>
        </symbol>
        <symbol id="brick" viewBox="0 0 120 120">
          <rect className="c" x="10" y="34" width="100" height="52" rx="4"/>
          <rect className="k" x="22" y="46" width="30" height="28" rx="3"/>
          <rect className="k" x="68" y="46" width="30" height="28" rx="3"/>
        </symbol>
        <symbol id="door" viewBox="0 0 120 120">
          <rect className="g" x="30" y="8" width="60" height="104" rx="3"/>
          <rect className="k" x="38" y="18" width="44" height="38" rx="2"/>
          <rect className="k" x="38" y="64" width="44" height="38" rx="2"/>
          <circle className="a" cx="80" cy="62" r="4"/>
        </symbol>
        <symbol id="book" viewBox="0 0 120 120">
          <rect className="e" x="22" y="10" width="76" height="100" rx="5"/>
          <path className="k" d="M33 10v100M44 70h44M44 84h30"/>
          <rect className="f" x="44" y="26" width="44" height="26" rx="2"/>
        </symbol>
        <symbol id="tv" viewBox="0 0 120 120">
          <rect className="h" x="8" y="16" width="104" height="72" rx="7"/>
          <rect className="e" x="15" y="23" width="90" height="58" rx="3"/>
          <path className="k" d="M60 88v16M42 106h36"/>
        </symbol>
        <symbol id="choc" viewBox="0 0 120 120">
          <rect className="g" x="20" y="8" width="80" height="104" rx="6"/>
          <path className="k" d="M20 34h80M20 60h80M20 86h80M46 8v104M73 8v104"/>
        </symbol>
        <symbol id="envelope" viewBox="0 0 120 120">
          <rect className="f" x="8" y="26" width="104" height="68" rx="5"/>
          <path className="k" d="M8 32l52 34 52-34M8 90l38-30M112 90L74 60"/>
        </symbol>
        <symbol id="phone" viewBox="0 0 120 120">
          <rect className="h" x="34" y="8" width="52" height="104" rx="10"/>
          <rect className="e" x="41" y="22" width="38" height="70" rx="2"/>
          <circle className="k" cx="60" cy="102" r="4"/>
        </symbol>

        {/* SQUARES */}
        <symbol id="chess" viewBox="0 0 120 120">
          <rect className="w" x="12" y="12" width="96" height="96"/>
          <rect className="z" x="36" y="12" width="24" height="24"/>
          <rect className="z" x="84" y="12" width="24" height="24"/>
          <rect className="z" x="12" y="36" width="24" height="24"/>
          <rect className="z" x="60" y="36" width="24" height="24"/>
          <rect className="z" x="36" y="60" width="24" height="24"/>
          <rect className="z" x="84" y="60" width="24" height="24"/>
          <rect className="z" x="12" y="84" width="24" height="24"/>
          <rect className="z" x="60" y="84" width="24" height="24"/>
        </symbol>
        <symbol id="dice" viewBox="0 0 120 120">
          <rect className="w" x="14" y="14" width="92" height="92" rx="14"/>
          <circle className="z" cx="36" cy="36" r="7"/>
          <circle className="z" cx="84" cy="36" r="7"/>
          <circle className="z" cx="60" cy="60" r="7"/>
          <circle className="z" cx="36" cy="84" r="7"/>
          <circle className="z" cx="84" cy="84" r="7"/>
        </symbol>
        <symbol id="sticky" viewBox="0 0 120 120">
          <rect className="a" x="14" y="14" width="92" height="92"/>
          <path className="k" d="M30 40h60M30 58h60M30 76h38"/>
          <path className="j" d="M80 106L106 80V106z"/>
        </symbol>
        <symbol id="frame" viewBox="0 0 120 120">
          <rect className="g" x="12" y="12" width="96" height="96" rx="3"/>
          <rect className="w" x="24" y="24" width="72" height="72"/>
          <rect className="e" x="30" y="30" width="60" height="60"/>
          <path className="d" d="M30 90V76Q55 56 90 76V90z"/>
          <circle className="a" cx="74" cy="46" r="7"/>
        </symbol>
        <symbol id="bread" viewBox="0 0 120 120">
          <path className="j" d="M20 50C8 50 8 24 30 24C40 14 80 14 90 24C112 24 112 50 100 50V104H20z"/>
          <rect className="f" x="30" y="58" width="60" height="36" rx="4"/>
        </symbol>
        <symbol id="cracker" viewBox="0 0 120 120">
          <rect className="j" x="14" y="14" width="92" height="92" rx="4"/>
          <circle className="g" cx="40" cy="40" r="3"/>
          <circle className="g" cx="80" cy="40" r="3"/>
          <circle className="g" cx="60" cy="60" r="3"/>
          <circle className="g" cx="40" cy="80" r="3"/>
          <circle className="g" cx="80" cy="80" r="3"/>
        </symbol>
        <symbol id="tile" viewBox="0 0 120 120">
          <rect className="l" x="12" y="12" width="96" height="96"/>
          <rect className="e" x="18" y="18" width="40" height="40"/>
          <rect className="w" x="62" y="18" width="40" height="40"/>
          <rect className="w" x="18" y="62" width="40" height="40"/>
          <rect className="e" x="62" y="62" width="40" height="40"/>
        </symbol>
        <symbol id="hanky" viewBox="0 0 120 120">
          <rect className="i" x="14" y="14" width="92" height="92"/>
          <rect className="k" x="24" y="24" width="72" height="72"/>
          <path className="k" d="M24 60h72M60 24v72"/>
        </symbol>
        <symbol id="cube" viewBox="0 0 120 120">
          <rect className="z" x="10" y="10" width="100" height="100" rx="8"/>
          <rect className="c" x="15" y="15" width="27" height="27"/>
          <rect className="e" x="46" y="15" width="27" height="27"/>
          <rect className="a" x="77" y="15" width="27" height="27"/>
          <rect className="d" x="15" y="46" width="27" height="27"/>
          <rect className="b" x="46" y="46" width="27" height="27"/>
          <rect className="w" x="77" y="46" width="27" height="27"/>
          <rect className="a" x="15" y="77" width="27" height="27"/>
          <rect className="c" x="46" y="77" width="27" height="27"/>
          <rect className="e" x="77" y="77" width="27" height="27"/>
        </symbol>
        <symbol id="waffle" viewBox="0 0 120 120">
          <rect className="j" x="12" y="12" width="96" height="96" rx="6"/>
          <path className="k" d="M36 12v96M60 12v96M84 12v96M12 36h96M12 60h96M12 84h96"/>
          <rect className="a" x="46" y="46" width="28" height="28" rx="3"/>
        </symbol>
        <symbol id="gift" viewBox="0 0 120 120">
          <rect className="c" x="14" y="14" width="92" height="92" rx="3"/>
          <rect className="a" x="52" y="14" width="16" height="92"/>
          <rect className="a" x="14" y="52" width="92" height="16"/>
          <path className="a" d="M60 50C40 26 24 40 36 48C44 52 56 52 60 50z"/>
          <path className="a" d="M60 50C80 26 96 40 84 48C76 52 64 52 60 50z"/>
        </symbol>
        <symbol id="calendar" viewBox="0 0 120 120">
          <rect className="w" x="14" y="18" width="92" height="92" rx="5"/>
          <path className="c" d="M14 40V23Q14 18 19 18H101Q106 18 106 23V40z"/>
          <path className="k" d="M36 12v14M84 12v14M14 60h92M14 80h92M44 40v70M75 40v70"/>
        </symbol>

        {/* OVALS */}
        <symbol id="egg" viewBox="0 0 120 120">
          <path className="f" d="M60 10C84 10 98 48 98 72C98 94 82 110 60 110C38 110 22 94 22 72C22 48 36 10 60 10z"/>
          <path className="k" d="M38 74q2-18 12-32"/>
        </symbol>
        <symbol id="rugby" viewBox="0 0 120 120">
          <g transform="rotate(-30 60 60)">
            <ellipse className="g" cx="60" cy="60" rx="52" ry="32"/>
            <path className="k" d="M22 40v40M98 40v40M34 60h52M42 52v16M54 52v16M66 52v16M78 52v16"/>
          </g>
        </symbol>
        <symbol id="chips" viewBox="0 0 120 120">
          <path className="a" d="M12 60C12 36 40 22 60 28C84 20 108 36 108 60C108 84 84 100 60 94C40 100 12 84 12 60z"/>
          <path className="k" d="M34 50q14-8 28 2M46 72q16 8 34-4"/>
        </symbol>
        <symbol id="fried" viewBox="0 0 120 120">
          <path className="w" d="M22 56C18 30 50 14 72 20C98 24 108 48 100 68C94 90 62 104 40 92C24 86 24 68 22 56z"/>
          <circle className="a" cx="62" cy="58" r="18"/>
          <path className="k" d="M54 50q4-6 10-6"/>
        </symbol>
        <symbol id="omirror" viewBox="0 0 120 120">
          <rect className="g" x="53" y="100" width="14" height="16" rx="5"/>
          <ellipse className="g" cx="60" cy="54" rx="42" ry="50"/>
          <ellipse className="l" cx="60" cy="54" rx="34" ry="42"/>
          <path className="k" d="M42 44q4-12 16-18"/>
        </symbol>
        <symbol id="balloon" viewBox="0 0 120 120">
          <ellipse className="c" cx="60" cy="46" rx="36" ry="44"/>
          <path className="c" d="M54 100l6-6 6 6z"/>
          <path className="k" d="M60 100q-9 8 0 14t0 6M40 34q4-12 14-16"/>
        </symbol>
        <symbol id="leaf" viewBox="0 0 120 120">
          <path className="d" d="M14 104C8 44 50 12 106 14C110 72 76 110 14 104z"/>
          <path className="k" d="M14 104L80 38M40 78h24M54 64h24M40 78v-22M54 64v-22"/>
        </symbol>
        <symbol id="platter" viewBox="0 0 120 120">
          <ellipse className="w" cx="60" cy="60" rx="52" ry="34"/>
          <ellipse className="k" cx="60" cy="60" rx="40" ry="22"/>
        </symbol>
        <symbol id="pebble" viewBox="0 0 120 120">
          <ellipse className="h" cx="60" cy="60" rx="48" ry="32" transform="rotate(-20 60 60)"/>
          <path className="k" d="M44 50q10-8 20-4M62 76q12 4 22-4"/>
        </symbol>

        {/* TRIANGLES */}
        <symbol id="sandwich" viewBox="0 0 120 120">
          <path className="j" d="M12 100L60 14L108 100z"/>
          <path className="f" d="M24 92L60 30L96 92z"/>
          <path className="d" d="M41.4 62H78.6L85.5 74H34.5z"/>
          <path className="c" d="M34.5 74H85.5L91.4 84H28.6z"/>
          <path className="a" d="M28.6 84H91.4L96 92H24z"/>
        </symbol>
        <symbol id="gamepad" viewBox="0 0 120 120">
          <path className="h" d="M60 14L108 98Q112 108 100 108H20Q8 108 12 98z"/>
          <rect className="b" x="32" y="80" width="20" height="7"/>
          <rect className="b" x="38.5" y="73.5" width="7" height="20"/>
          <circle className="c" cx="84" cy="76" r="5"/>
          <circle className="d" cx="78" cy="84" r="5"/>
          <circle className="e" cx="90" cy="84" r="5"/>
          <circle className="a" cx="84" cy="92" r="5"/>
          <path className="f" d="M60 40l9 16H51z"/>
        </symbol>
        <symbol id="slice" viewBox="0 0 120 120">
          <path className="a" d="M60 104L20 32Q60 18 100 32z"/>
          <path className="b" d="M14 24Q60 6 106 24L100 32Q60 18 20 32z"/>
          <circle className="c" cx="60" cy="48" r="6"/>
          <circle className="c" cx="48" cy="66" r="6"/>
          <circle className="c" cx="72" cy="66" r="6"/>
          <circle className="c" cx="60" cy="84" r="5"/>
        </symbol>
        <symbol id="tent" viewBox="0 0 120 120">
          <path className="b" d="M60 12L110 104H10z"/>
          <path className="g" d="M60 58L80 104H40z"/>
          <path className="k" d="M4 104h112"/>
        </symbol>
        <symbol id="hat" viewBox="0 0 120 120">
          <path className="i" d="M60 14L98 108H22z"/>
          <circle className="a" cx="60" cy="12" r="7"/>
          <circle className="a" cx="60" cy="44" r="4"/>
          <circle className="a" cx="52" cy="64" r="4"/>
          <circle className="a" cx="68" cy="64" r="4"/>
          <circle className="a" cx="44" cy="86" r="4"/>
          <circle className="a" cx="60" cy="86" r="4"/>
          <circle className="a" cx="76" cy="86" r="4"/>
        </symbol>
        <symbol id="sign" viewBox="0 0 120 120">
          <path className="c" d="M60 12L112 102H8z"/>
          <path className="w" d="M60 32L94 92H26z"/>
          <path className="k" d="M60 48v22"/>
          <circle className="z" cx="60" cy="81" r="3"/>
        </symbol>
        <symbol id="samosa" viewBox="0 0 120 120">
          <path className="j" d="M60 12L108 100H12z"/>
          <path className="k" d="M24 80Q60 62 96 80M34 92Q60 76 86 92"/>
        </symbol>
        <symbol id="house" viewBox="0 0 120 120">
          <rect className="f" x="18" y="62" width="84" height="46"/>
          <path className="c" d="M60 12L114 62H6z"/>
          <rect className="g" x="50" y="76" width="20" height="32"/>
          <rect className="e" x="26" y="72" width="16" height="16"/>
          <rect className="e" x="78" y="72" width="16" height="16"/>
        </symbol>
        <symbol id="tree" viewBox="0 0 120 120">
          <rect className="g" x="52" y="100" width="16" height="14"/>
          <path className="d" d="M60 56L108 102H12z"/>
          <path className="d" d="M60 32L100 74H20z"/>
          <path className="d" d="M60 8L90 42H30z"/>
          <circle className="c" cx="46" cy="86" r="4"/>
          <circle className="a" cx="76" cy="90" r="4"/>
          <circle className="c" cx="60" cy="64" r="4"/>
          <circle className="a" cx="60" cy="38" r="3"/>
        </symbol>
        <symbol id="pennant" viewBox="0 0 120 120">
          <path className="c" d="M14 24L110 60L14 96z"/>
          <path className="k" d="M14 8V116"/>
        </symbol>
        <symbol id="cheese" viewBox="0 0 120 120">
          <path className="a" d="M12 100L108 100V52z"/>
          <circle className="f" cx="80" cy="86" r="6"/>
          <circle className="f" cx="96" cy="74" r="4"/>
          <circle className="f" cx="58" cy="92" r="4"/>
        </symbol>
      </defs>
    </svg>
  );
}
