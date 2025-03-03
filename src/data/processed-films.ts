export interface Film {
  id: string;
  name: string;
  type: "B&W" | "Color";
  isos: number[];
  manufacturer: string;
  alias?: string[];
  formats: ("35mm" | "120" | "sheet")[];
}

export const films: Film[] = [
  {
    "id": "adoxchm",
    "name": "Adox CHM",
    "type": "B&W",
    "isos": [
      80,
      100,
      125,
      160,
      200,
      400,
      500,
      640,
      800,
      1000,
      1600
    ],
    "manufacturer": "Adox",
    "formats": [
      "35mm"
    ]
  },
  {
    "id": "adoxchs",
    "name": "Adox CHS",
    "type": "B&W",
    "isos": [
      8,
      10,
      12,
      16,
      20,
      25,
      32,
      40,
      50,
      64,
      80,
      100,
      125,
      160,
      200,
      250,
      400,
      500
    ],
    "manufacturer": "Adox",
    "formats": [
      "35mm",
      "120",
      "sheet"
    ]
  },
  {
    "id": "adoxchs100ii",
    "name": "Adox CHS 100 II",
    "type": "B&W",
    "isos": [
      100,
      125,
      200,
      250,
      400,
      500
    ],
    "manufacturer": "Adox",
    "formats": [
      "35mm",
      "120",
      "sheet"
    ]
  },
  {
    "id": "adoxcms20ii",
    "name": "Adox CMS 20 II",
    "type": "B&W",
    "isos": [
      3,
      6,
      8,
      10,
      12,
      20,
      25,
      32,
      40
    ],
    "manufacturer": "Adox",
    "formats": [
      "35mm",
      "120",
      "sheet"
    ]
  },
  {
    "id": "adoxhr50irhr",
    "name": "Adox HR-50/IR-HR",
    "type": "B&W",
    "isos": [
      25,
      40,
      50,
      80,
      100
    ],
    "manufacturer": "Adox",
    "formats": [
      "35mm"
    ]
  },
  {
    "id": "adoxort25",
    "name": "Adox Ort 25",
    "type": "B&W",
    "isos": [
      20,
      25
    ],
    "manufacturer": "Adox",
    "formats": [
      "35mm",
      "120",
      "sheet"
    ]
  },
  {
    "id": "adoxpan25",
    "name": "Adox Pan 25",
    "type": "B&W",
    "isos": [
      25
    ],
    "manufacturer": "Adox",
    "formats": [
      "35mm",
      "120",
      "sheet"
    ]
  },
  {
    "id": "adoxscala",
    "name": "Adox Scala",
    "type": "B&W",
    "isos": [
      50,
      100
    ],
    "manufacturer": "Adox",
    "formats": [
      "35mm"
    ]
  },
  {
    "id": "adoxsilvermax",
    "name": "Adox Silvermax",
    "type": "B&W",
    "isos": [
      40,
      50,
      80,
      100,
      160,
      200,
      320,
      400
    ],
    "manufacturer": "Adox",
    "formats": [
      "35mm"
    ]
  },
  {
    "id": "agfaphotoapx100",
    "name": "AgfaPhoto APX 100",
    "type": "B&W",
    "isos": [
      24,
      50,
      64,
      80,
      100,
      125,
      160,
      200,
      400,
      640,
      800,
      1000
    ],
    "manufacturer": "AgfaPhoto",
    "formats": [
      "35mm"
    ]
  },
  {
    "id": "agfaphotoapx400",
    "name": "AgfaPhoto APX 400",
    "type": "B&W",
    "isos": [
      10,
      200,
      250,
      320,
      400,
      500,
      800,
      1000,
      1600,
      3200
    ],
    "manufacturer": "AgfaPhoto",
    "formats": [
      "35mm"
    ]
  },
  {
    "id": "agfaaviphot",
    "name": "Agfa Aviphot",
    "type": "B&W",
    "isos": [
      40,
      100,
      200,
      400,
      800
    ],
    "manufacturer": "Agfa",
    "formats": [
      "35mm",
      "120",
      "sheet"
    ]
  },
  {
    "id": "agfacinerex",
    "name": "Agfa Cinerex",
    "type": "B&W",
    "isos": [
      25,
      50,
      100,
      200,
      400
    ],
    "manufacturer": "Agfa",
    "formats": [
      "35mm"
    ]
  },
  {
    "id": "agfacopex",
    "name": "Agfa Copex",
    "type": "B&W",
    "isos": [
      12,
      20,
      25,
      32,
      40,
      50,
      64,
      100
    ],
    "manufacturer": "Agfa",
    "formats": [
      "35mm",
      "120",
      "sheet"
    ]
  },
  {
    "id": "agfascala",
    "name": "Agfa Scala",
    "type": "B&W",
    "isos": [
      100,
      160,
      200,
      400
    ],
    "manufacturer": "Agfa",
    "formats": [
      "35mm",
      "120"
    ]
  },
  {
    "id": "argentifilms",
    "name": "Argenti films",
    "type": "B&W",
    "isos": [
      12,
      25,
      32,
      50,
      100,
      200,
      320,
      400,
      800,
      1600
    ],
    "manufacturer": "Argenti",
    "formats": [
      "35mm"
    ]
  },
  {
    "id": "aristaedudx",
    "name": "Arista EDU DX",
    "type": "B&W",
    "isos": [
      100,
      400
    ],
    "manufacturer": "Arista",
    "formats": [
      "35mm"
    ]
  },
  {
    "id": "aristaeduultra",
    "name": "Arista EDU Ultra",
    "type": "B&W",
    "isos": [
      50,
      64,
      80,
      100,
      125,
      200,
      250,
      320,
      400,
      800,
      1600
    ],
    "manufacturer": "Arista",
    "formats": [
      "35mm",
      "120",
      "sheet"
    ]
  },
  {
    "id": "aristaortholitho",
    "name": "Arista Ortho Litho",
    "type": "B&W",
    "isos": [
      0,
      1,
      3,
      6,
      25
    ],
    "manufacturer": "Arista",
    "formats": [
      "sheet"
    ]
  },
  {
    "id": "aristapremium",
    "name": "Arista Premium",
    "type": "B&W",
    "isos": [
      32,
      50,
      64,
      80,
      100,
      125,
      185,
      200,
      250,
      320,
      400,
      500,
      600,
      640,
      800,
      1000,
      1600,
      3200,
      12800
    ],
    "manufacturer": "Arista",
    "formats": [
      "35mm"
    ]
  },
  {
    "id": "aristaallfilms",
    "name": "Arista (All Films)",
    "type": "B&W",
    "isos": [
      0,
      1,
      3,
      6,
      25,
      32,
      50,
      64,
      80,
      100,
      125,
      150,
      160,
      185,
      200,
      250,
      320,
      400,
      500,
      600,
      640,
      800,
      1000,
      1600,
      3200,
      6400,
      12800
    ],
    "manufacturer": "Arista",
    "formats": [
      "sheet",
      "35mm",
      "120"
    ]
  },
  {
    "id": "arsimagofilms",
    "name": "Ars-imago films",
    "type": "B&W",
    "isos": [
      200,
      320,
      640
    ],
    "manufacturer": "Ars-imago",
    "formats": [
      "35mm",
      "120"
    ]
  },
  {
    "id": "astrumfilms",
    "name": "Astrum films",
    "type": "B&W",
    "isos": [
      0,
      3,
      25,
      50,
      64,
      100,
      125,
      200,
      320,
      400,
      640,
      800,
      3200
    ],
    "manufacturer": "Astrum",
    "formats": [
      "35mm",
      "120",
      "sheet"
    ]
  },
  {
    "id": "bcgp400",
    "name": "BCG P-400",
    "type": "B&W",
    "isos": [
      400
    ],
    "manufacturer": "BCG",
    "formats": [
      "35mm"
    ]
  },
  {
    "id": "berggerpancro400",
    "name": "Bergger Pancro 400",
    "type": "B&W",
    "isos": [
      80,
      100,
      125,
      160,
      200,
      250,
      320,
      400,
      500,
      800,
      1600
    ],
    "manufacturer": "Bergger",
    "formats": [
      "35mm",
      "120",
      "sheet"
    ]
  },
  {
    "id": "bluefirefilms",
    "name": "Bluefire films",
    "type": "B&W",
    "isos": [
      80,
      400
    ],
    "manufacturer": "Bluefire",
    "formats": [
      "35mm",
      "120"
    ]
  },
  {
    "id": "chmuniversal",
    "name": "CHM Universal",
    "type": "B&W",
    "isos": [
      80,
      100,
      125,
      160,
      200,
      400,
      500,
      640,
      800,
      1000,
      1600
    ],
    "manufacturer": "CHM",
    "formats": [
      "35mm"
    ]
  },
  {
    "id": "catlabsfilms",
    "name": "CatLABS films",
    "type": "B&W",
    "isos": [
      32,
      50,
      64,
      80,
      100,
      200,
      250,
      320,
      400,
      800,
      1600,
      3200
    ],
    "manufacturer": "CatLABS",
    "formats": [
      "35mm",
      "120",
      "sheet"
    ]
  },
  {
    "id": "cinestillbwxx",
    "name": "CineStill BwXX",
    "type": "B&W",
    "isos": [
      25,
      64,
      100,
      125,
      200,
      250,
      320,
      400,
      500,
      600,
      640,
      800,
      1000,
      1250,
      1600,
      3200
    ],
    "manufacturer": "CineStill",
    "formats": [
      "35mm",
      "120"
    ]
  },
  {
    "id": "contrasto200",
    "name": "Contrasto 200",
    "type": "B&W",
    "isos": [
      12,
      40,
      50,
      80,
      100,
      125,
      160,
      200,
      250,
      320,
      400,
      640,
      800,
      1000,
      1600
    ],
    "manufacturer": "Contrasto",
    "formats": [
      "35mm"
    ]
  },
  {
    "id": "dryplates",
    "name": "Dry Plates",
    "type": "B&W",
    "isos": [
      2
    ],
    "manufacturer": "Dry",
    "formats": [
      "sheet"
    ]
  },
  {
    "id": "dubblefilmfilms",
    "name": "Dubblefilm films",
    "type": "B&W",
    "isos": [
      400
    ],
    "manufacturer": "Dubblefilm",
    "formats": [
      "35mm"
    ]
  },
  {
    "id": "erafilms",
    "name": "ERA films",
    "type": "B&W",
    "isos": [
      50,
      80,
      100,
      200,
      400
    ],
    "manufacturer": "ERA",
    "formats": [
      "35mm",
      "sheet"
    ]
  },
  {
    "id": "eastmanfilms",
    "name": "Eastman films",
    "type": "B&W",
    "isos": [
      3,
      6,
      12,
      25,
      50,
      64,
      80,
      100,
      125,
      200,
      250,
      320,
      400,
      500,
      600,
      640,
      800,
      1000,
      1250,
      1600,
      3200
    ],
    "manufacturer": "Eastman",
    "formats": [
      "35mm"
    ]
  },
  {
    "id": "efke100",
    "name": "Efke 100",
    "type": "B&W",
    "isos": [
      50,
      64,
      80,
      100,
      130,
      160,
      200,
      250,
      400,
      800
    ],
    "manufacturer": "Efke",
    "formats": [
      "35mm",
      "120",
      "sheet"
    ]
  },
  {
    "id": "efke25",
    "name": "Efke 25",
    "type": "B&W",
    "isos": [
      8,
      10,
      12,
      16,
      20,
      25,
      32,
      50,
      64
    ],
    "manufacturer": "Efke",
    "formats": [
      "35mm",
      "120",
      "sheet"
    ]
  },
  {
    "id": "efke50",
    "name": "Efke 50",
    "type": "B&W",
    "isos": [
      25,
      32,
      40,
      50,
      64,
      80,
      100,
      160
    ],
    "manufacturer": "Efke",
    "formats": [
      "35mm",
      "120",
      "sheet"
    ]
  },
  {
    "id": "efkeir820",
    "name": "Efke IR820",
    "type": "B&W",
    "isos": [
      1,
      3,
      4,
      6,
      12,
      15,
      40,
      50,
      64,
      100,
      200,
      250
    ],
    "manufacturer": "Efke",
    "formats": [
      "120",
      "35mm",
      "sheet"
    ]
  },
  {
    "id": "etudepan",
    "name": "Etude Pan",
    "type": "B&W",
    "isos": [
      400
    ],
    "manufacturer": "Etude",
    "formats": [
      "35mm"
    ]
  },
  {
    "id": "fppfilms",
    "name": "FPP films",
    "type": "B&W",
    "isos": [
      0,
      6,
      10,
      25,
      32,
      50,
      64,
      100,
      125,
      160,
      200,
      400,
      1600
    ],
    "manufacturer": "FPP",
    "formats": [
      "35mm",
      "120",
      "sheet"
    ]
  },
  {
    "id": "ferraniap30",
    "name": "Ferrania P30",
    "type": "B&W",
    "isos": [
      25,
      32,
      50,
      64,
      80
    ],
    "manufacturer": "Ferrania",
    "formats": [
      "120",
      "35mm",
      "sheet"
    ]
  },
  {
    "id": "filmotecfilms",
    "name": "Filmotec films",
    "type": "B&W",
    "isos": [
      6,
      10,
      12,
      25
    ],
    "manufacturer": "Filmotec",
    "formats": [
      "35mm"
    ]
  },
  {
    "id": "fomaortho400",
    "name": "Foma Ortho 400",
    "type": "B&W",
    "isos": [
      320,
      400,
      1600
    ],
    "manufacturer": "Foma",
    "formats": [
      "120",
      "35mm"
    ]
  },
  {
    "id": "fomaretropan320",
    "name": "Foma Retropan 320",
    "type": "B&W",
    "isos": [
      125,
      160,
      200,
      250,
      320,
      400,
      640,
      800,
      3200
    ],
    "manufacturer": "Foma",
    "formats": [
      "120",
      "35mm",
      "sheet"
    ]
  },
  {
    "id": "fomapan100",
    "name": "Fomapan 100",
    "type": "B&W",
    "isos": [
      40,
      50,
      64,
      80,
      100,
      125,
      200,
      250,
      400,
      800,
      1600,
      3200
    ],
    "manufacturer": "Fomapan",
    "formats": [
      "35mm",
      "120",
      "sheet"
    ]
  },
  {
    "id": "fomapan200",
    "name": "Fomapan 200",
    "type": "B&W",
    "isos": [
      25,
      50,
      64,
      100,
      125,
      160,
      200,
      250,
      400,
      800,
      1600,
      3200
    ],
    "manufacturer": "Fomapan",
    "formats": [
      "35mm",
      "120",
      "sheet"
    ]
  },
  {
    "id": "fomapan400",
    "name": "Fomapan 400",
    "type": "B&W",
    "isos": [
      100,
      160,
      200,
      240,
      250,
      320,
      400,
      640,
      800,
      1600,
      3200,
      6400
    ],
    "manufacturer": "Fomapan",
    "formats": [
      "35mm",
      "120",
      "sheet"
    ]
  },
  {
    "id": "fujihrrxc",
    "name": "Fuji HR/RX/C",
    "type": "B&W",
    "isos": [
      15,
      20,
      25,
      50,
      80,
      100,
      200,
      400
    ],
    "manufacturer": "Fuji",
    "formats": [
      "35mm",
      "120",
      "sheet"
    ]
  },
  {
    "id": "fujineopan100ss",
    "name": "Fuji Neopan 100ss",
    "type": "B&W",
    "isos": [
      50,
      80,
      100,
      200,
      400,
      800,
      1600
    ],
    "manufacturer": "Fuji",
    "formats": [
      "35mm",
      "120",
      "sheet"
    ]
  },
  {
    "id": "fujineopan1600",
    "name": "Fuji Neopan 1600",
    "type": "B&W",
    "isos": [
      100,
      200,
      250,
      320,
      400,
      500,
      640,
      800,
      1000,
      1600,
      2400,
      3200,
      6400,
      12500
    ],
    "manufacturer": "Fuji",
    "formats": [
      "35mm"
    ]
  },
  {
    "id": "fujineopan400",
    "name": "Fuji Neopan 400",
    "type": "B&W",
    "isos": [
      100,
      200,
      250,
      320,
      400,
      600,
      640,
      800,
      1000,
      1600,
      3200
    ],
    "manufacturer": "Fuji",
    "formats": [
      "35mm",
      "120"
    ]
  },
  {
    "id": "fujineopanacrosii",
    "name": "Fuji Neopan Acros II",
    "type": "B&W",
    "isos": [
      40,
      50,
      64,
      80,
      100,
      125,
      200,
      340,
      400,
      800,
      1250,
      1600
    ],
    "manufacturer": "Fuji",
    "formats": [
      "35mm",
      "120",
      "sheet"
    ]
  },
  {
    "id": "fujirds4791",
    "name": "Fuji RDS 4791",
    "type": "B&W",
    "isos": [
      6,
      15,
      20,
      25
    ],
    "manufacturer": "Fuji",
    "formats": [
      "35mm"
    ]
  },
  {
    "id": "holga400",
    "name": "Holga 400",
    "type": "B&W",
    "isos": [
      25,
      100,
      200,
      240,
      320,
      400,
      800,
      1600,
      3200
    ],
    "manufacturer": "Holga",
    "formats": [
      "35mm",
      "120"
    ]
  },
  {
    "id": "ilforddelta100",
    "name": "Ilford Delta 100",
    "type": "B&W",
    "isos": [
      10,
      25,
      40,
      50,
      64,
      80,
      100,
      125,
      140,
      150,
      160,
      200,
      320,
      400,
      640,
      800,
      1000,
      1250
    ],
    "manufacturer": "Ilford",
    "formats": [
      "35mm",
      "120",
      "sheet"
    ]
  },
  {
    "id": "ilforddelta3200",
    "name": "Ilford Delta 3200",
    "type": "B&W",
    "isos": [
      25,
      100,
      250,
      320,
      400,
      800,
      1000,
      1250,
      1280,
      1600,
      3200,
      4800,
      6400,
      12500,
      12800,
      25000
    ],
    "manufacturer": "Ilford",
    "formats": [
      "35mm",
      "120"
    ]
  },
  {
    "id": "ilforddelta400",
    "name": "Ilford Delta 400",
    "type": "B&W",
    "isos": [
      100,
      125,
      160,
      200,
      250,
      320,
      400,
      500,
      600,
      640,
      800,
      1000,
      1250,
      1600,
      2000,
      3200,
      6400
    ],
    "manufacturer": "Ilford",
    "formats": [
      "35mm",
      "120",
      "sheet"
    ]
  },
  {
    "id": "ilfordfp4",
    "name": "Ilford FP4+",
    "type": "B&W",
    "isos": [
      25,
      32,
      50,
      64,
      65,
      80,
      100,
      125,
      160,
      185,
      200,
      250,
      320,
      400,
      500,
      640,
      800,
      1000,
      1600,
      6400
    ],
    "manufacturer": "Ilford",
    "formats": [
      "35mm",
      "120",
      "sheet"
    ]
  },
  {
    "id": "ilfordhp5",
    "name": "Ilford HP5+",
    "type": "B&W",
    "isos": [
      25,
      50,
      100,
      125,
      160,
      200,
      250,
      320,
      400,
      500,
      600,
      640,
      800,
      1000,
      1250,
      1600,
      2000,
      3200,
      6400,
      12800
    ],
    "manufacturer": "Ilford",
    "formats": [
      "sheet",
      "35mm",
      "120"
    ]
  },
  {
    "id": "ilfordortho",
    "name": "Ilford Ortho+",
    "type": "B&W",
    "isos": [
      40,
      50,
      80,
      100,
      125,
      160,
      200,
      320
    ],
    "manufacturer": "Ilford",
    "formats": [
      "35mm",
      "120",
      "sheet"
    ]
  },
  {
    "id": "ilfordpan100",
    "name": "Ilford Pan 100",
    "type": "B&W",
    "isos": [
      50,
      80,
      100,
      200,
      400,
      800,
      1600
    ],
    "manufacturer": "Ilford",
    "formats": [
      "35mm"
    ]
  },
  {
    "id": "ilfordpan400",
    "name": "Ilford Pan 400",
    "type": "B&W",
    "isos": [
      200,
      320,
      400,
      800,
      1600,
      3200
    ],
    "manufacturer": "Ilford",
    "formats": [
      "35mm",
      "120"
    ]
  },
  {
    "id": "ilfordpanf",
    "name": "Ilford Pan F+",
    "type": "B&W",
    "isos": [
      12,
      16,
      20,
      25,
      32,
      40,
      50,
      64,
      75,
      80,
      100,
      125,
      200,
      400,
      800
    ],
    "manufacturer": "Ilford",
    "formats": [
      "35mm",
      "120"
    ]
  },
  {
    "id": "ilfordsfx200",
    "name": "Ilford SFX 200",
    "type": "B&W",
    "isos": [
      12,
      32,
      80,
      100,
      125,
      160,
      200,
      250,
      400,
      640,
      800,
      1600
    ],
    "manufacturer": "Ilford",
    "formats": [
      "35mm",
      "120"
    ]
  },
  {
    "id": "ilfordsurveillance",
    "name": "Ilford Surveillance",
    "type": "B&W",
    "isos": [
      100,
      125,
      250,
      400,
      800,
      1600,
      2500
    ],
    "manufacturer": "Ilford",
    "formats": [
      "35mm"
    ]
  },
  {
    "id": "ilfordxp2",
    "name": "Ilford XP2",
    "type": "B&W",
    "isos": [
      200,
      400,
      800,
      1600,
      3200
    ],
    "manufacturer": "Ilford",
    "formats": [
      "35mm",
      "120"
    ]
  },
  {
    "id": "imago320",
    "name": "Imago 320",
    "type": "B&W",
    "isos": [
      200,
      320,
      640
    ],
    "manufacturer": "Imago",
    "formats": [
      "35mm",
      "120"
    ]
  },
  {
    "id": "jchstreetpan",
    "name": "JCH Streetpan",
    "type": "B&W",
    "isos": [
      80,
      160,
      200,
      400,
      1600
    ],
    "manufacturer": "JCH",
    "formats": [
      "35mm"
    ]
  },
  {
    "id": "kentmerefilms",
    "name": "Kentmere films",
    "type": "B&W",
    "isos": [
      25,
      50,
      64,
      80,
      100,
      125,
      160,
      200,
      250,
      320,
      400,
      500,
      640,
      800,
      1000,
      1600,
      3200,
      6400
    ],
    "manufacturer": "Kentmere",
    "formats": [
      "35mm",
      "120"
    ]
  },
  {
    "id": "kikipan320",
    "name": "Kiki Pan 320",
    "type": "B&W",
    "isos": [
      320
    ],
    "manufacturer": "Kiki",
    "formats": [
      "35mm"
    ]
  },
  {
    "id": "kodak2films",
    "name": "Kodak 2*** films",
    "type": "B&W",
    "isos": [
      0,
      1,
      3,
      6,
      8,
      12,
      16,
      20,
      25,
      50,
      100,
      400
    ],
    "manufacturer": "Kodak",
    "formats": [
      "35mm",
      "120"
    ]
  },
  {
    "id": "kodakbw400cn",
    "name": "Kodak BW400CN",
    "type": "B&W",
    "isos": [
      400,
      1600
    ],
    "manufacturer": "Kodak",
    "formats": [
      "120",
      "35mm"
    ]
  },
  {
    "id": "kodakdirectpositive",
    "name": "Kodak Direct Positive",
    "type": "B&W",
    "isos": [
      50,
      80
    ],
    "manufacturer": "Kodak",
    "formats": [
      "35mm"
    ]
  },
  {
    "id": "kodakdoublex",
    "name": "Kodak Double-X",
    "type": "B&W",
    "isos": [
      25,
      64,
      100,
      125,
      200,
      250,
      320,
      400,
      500,
      600,
      640,
      800,
      1000,
      1250,
      1600,
      3200
    ],
    "manufacturer": "Kodak",
    "formats": [
      "35mm",
      "120"
    ]
  },
  {
    "id": "kodakhieinfrared",
    "name": "Kodak HIE Infrared",
    "type": "B&W",
    "isos": [
      50,
      64,
      100,
      200,
      320,
      400,
      800,
      1600,
      2000
    ],
    "manufacturer": "Kodak",
    "formats": [
      "35mm",
      "120",
      "sheet"
    ]
  },
  {
    "id": "kodakhawkeye",
    "name": "Kodak Hawkeye",
    "type": "B&W",
    "isos": [
      400,
      1600
    ],
    "manufacturer": "Kodak",
    "formats": [
      "35mm"
    ]
  },
  {
    "id": "kodakplusx",
    "name": "Kodak Plus-X",
    "type": "B&W",
    "isos": [
      32,
      50,
      64,
      80,
      100,
      125,
      160,
      185,
      200,
      250,
      320,
      400,
      500,
      640,
      1000
    ],
    "manufacturer": "Kodak",
    "formats": [
      "35mm",
      "120",
      "sheet"
    ]
  },
  {
    "id": "kodaktmax100",
    "name": "Kodak TMax 100",
    "type": "B&W",
    "isos": [
      25,
      50,
      64,
      80,
      100,
      125,
      150,
      160,
      200,
      250,
      320,
      400,
      640,
      800,
      1000,
      1600,
      3200
    ],
    "manufacturer": "Kodak",
    "formats": [
      "35mm",
      "120",
      "sheet"
    ]
  },
  {
    "id": "kodaktmax400",
    "name": "Kodak TMax 400",
    "type": "B&W",
    "isos": [
      50,
      100,
      160,
      200,
      250,
      320,
      400,
      500,
      600,
      640,
      650,
      800,
      1000,
      1200,
      1250,
      1600,
      3200
    ],
    "manufacturer": "Kodak",
    "formats": [
      "35mm",
      "120",
      "sheet"
    ]
  },
  {
    "id": "kodaktmaxp3200",
    "name": "Kodak TMax P3200",
    "type": "B&W",
    "isos": [
      100,
      200,
      320,
      400,
      800,
      1000,
      1250,
      1280,
      1600,
      2000,
      2500,
      3200,
      4800,
      6400,
      12500,
      12800,
      25000,
      25600,
      51200,
      102400
    ],
    "manufacturer": "Kodak",
    "formats": [
      "35mm"
    ]
  },
  {
    "id": "kodaktrix320",
    "name": "Kodak Tri-X 320",
    "type": "B&W",
    "isos": [
      80,
      160,
      200,
      250,
      320,
      400,
      640,
      800,
      1000,
      1200,
      1250,
      1600,
      2500,
      5000,
      6500
    ],
    "manufacturer": "Kodak",
    "formats": [
      "120",
      "sheet"
    ]
  },
  {
    "id": "kodaktrix400",
    "name": "Kodak Tri-X 400",
    "type": "B&W",
    "isos": [
      25,
      50,
      100,
      160,
      200,
      250,
      320,
      400,
      500,
      600,
      640,
      800,
      1000,
      1250,
      1600,
      2000,
      2400,
      3200,
      6400,
      12800
    ],
    "manufacturer": "Kodak",
    "formats": [
      "120",
      "35mm"
    ]
  },
  {
    "id": "kosmofotofilms",
    "name": "Kosmo Foto films",
    "type": "B&W",
    "isos": [
      25,
      50,
      80,
      100,
      200,
      250,
      320,
      400,
      500,
      640,
      800,
      1000,
      1600,
      3200,
      6400
    ],
    "manufacturer": "Kosmo",
    "formats": [
      "35mm",
      "120"
    ]
  },
  {
    "id": "legacyprofilms",
    "name": "Legacy Pro films",
    "type": "B&W",
    "isos": [
      50,
      80,
      100,
      125,
      200,
      250,
      320,
      400,
      600,
      640,
      800,
      1600,
      3200
    ],
    "manufacturer": "Legacy",
    "formats": [
      "35mm"
    ]
  },
  {
    "id": "lomobabylon",
    "name": "Lomo Babylon",
    "type": "B&W",
    "isos": [
      8,
      13
    ],
    "manufacturer": "Lomo",
    "formats": [
      "35mm"
    ]
  },
  {
    "id": "lomoberlin",
    "name": "Lomo Berlin",
    "type": "B&W",
    "isos": [
      100,
      320,
      400,
      800
    ],
    "manufacturer": "Lomo",
    "formats": [
      "35mm",
      "120"
    ]
  },
  {
    "id": "lomoearlgrey",
    "name": "Lomo Earl Grey",
    "type": "B&W",
    "isos": [
      80,
      100,
      200,
      400
    ],
    "manufacturer": "Lomo",
    "formats": [
      "35mm",
      "120"
    ]
  },
  {
    "id": "lomofantome",
    "name": "Lomo Fantome",
    "type": "B&W",
    "isos": [
      8,
      50
    ],
    "manufacturer": "Lomo",
    "formats": [
      "35mm"
    ]
  },
  {
    "id": "lomoladygrey",
    "name": "Lomo Lady Grey",
    "type": "B&W",
    "isos": [
      200,
      320,
      400
    ],
    "manufacturer": "Lomo",
    "formats": [
      "35mm",
      "120"
    ]
  },
  {
    "id": "lomoorca110",
    "name": "Lomo Orca 110",
    "type": "B&W",
    "isos": [
      80,
      100
    ],
    "manufacturer": "Lomo",
    "formats": [
      "35mm",
      "120"
    ]
  },
  {
    "id": "lomopotsdam",
    "name": "Lomo Potsdam",
    "type": "B&W",
    "isos": [
      100,
      400,
      800
    ],
    "manufacturer": "Lomo",
    "formats": [
      "35mm"
    ]
  },
  {
    "id": "lowspeedbw",
    "name": "Low Speed B&W",
    "type": "B&W",
    "isos": [
      3
    ],
    "manufacturer": "Low",
    "formats": [
      "35mm",
      "120"
    ]
  },
  {
    "id": "luckyfilms",
    "name": "Lucky films",
    "type": "B&W",
    "isos": [
      50,
      64,
      80,
      100,
      125,
      200,
      250,
      400,
      800,
      6400
    ],
    "manufacturer": "Lucky",
    "formats": [
      "35mm",
      "120",
      "sheet"
    ]
  },
  {
    "id": "macofilms",
    "name": "Maco films",
    "type": "B&W",
    "isos": [
      3,
      4,
      6,
      12,
      15,
      20,
      25,
      40,
      50,
      64,
      80,
      100,
      200,
      250,
      400,
      640,
      800,
      1600
    ],
    "manufacturer": "Maco",
    "formats": [
      "35mm",
      "120",
      "sheet"
    ]
  },
  {
    "id": "newclassicez400",
    "name": "New Classic EZ400",
    "type": "B&W",
    "isos": [
      400
    ],
    "manufacturer": "New",
    "formats": [
      "35mm"
    ]
  },
  {
    "id": "nocolorstudiofilms",
    "name": "NoColorStudio films",
    "type": "B&W",
    "isos": [
      5,
      6,
      100,
      990
    ],
    "manufacturer": "NoColorStudio",
    "formats": [
      "35mm"
    ]
  },
  {
    "id": "orwofilms",
    "name": "Orwo films",
    "type": "B&W",
    "isos": [
      6,
      8,
      10,
      12,
      25,
      50,
      80,
      100,
      125,
      160,
      200,
      250,
      320,
      400,
      800,
      1600
    ],
    "manufacturer": "Orwo",
    "formats": [
      "35mm",
      "120"
    ]
  },
  {
    "id": "polypanf",
    "name": "Polypan F",
    "type": "B&W",
    "isos": [
      12,
      25,
      32,
      50,
      64,
      65,
      80,
      100,
      125,
      200,
      400
    ],
    "manufacturer": "Polypan",
    "formats": [
      "35mm"
    ]
  },
  {
    "id": "rerapan",
    "name": "ReraPan",
    "type": "B&W",
    "isos": [
      80,
      100,
      200,
      320,
      400,
      800,
      1600
    ],
    "manufacturer": "ReraPan",
    "formats": [
      "120"
    ]
  },
  {
    "id": "rolleiatpato",
    "name": "Rollei ATP/ATO",
    "type": "B&W",
    "isos": [
      1,
      10,
      15,
      16,
      20,
      25,
      32,
      40
    ],
    "manufacturer": "Rollei",
    "formats": [
      "35mm",
      "120",
      "sheet"
    ]
  },
  {
    "id": "rolleiblackbird",
    "name": "Rollei Blackbird",
    "type": "B&W",
    "isos": [
      25,
      64,
      100,
      200
    ],
    "manufacturer": "Rollei",
    "formats": [
      "35mm"
    ]
  },
  {
    "id": "rolleiinfraredir400",
    "name": "Rollei Infrared IR400",
    "type": "B&W",
    "isos": [
      2,
      3,
      6,
      8,
      10,
      12,
      16,
      25,
      40,
      50,
      64,
      80,
      100,
      125,
      160,
      200,
      250,
      400,
      640,
      800,
      1000,
      1600
    ],
    "manufacturer": "Rollei",
    "formats": [
      "35mm",
      "120",
      "sheet"
    ]
  },
  {
    "id": "rolleiortho",
    "name": "Rollei Ortho",
    "type": "B&W",
    "isos": [
      12,
      20,
      25,
      32,
      40,
      50,
      80,
      100,
      125,
      160,
      200
    ],
    "manufacturer": "Rollei",
    "formats": [
      "35mm",
      "120",
      "sheet"
    ]
  },
  {
    "id": "rolleipaulreinhold",
    "name": "Rollei Paul & Reinhold",
    "type": "B&W",
    "isos": [
      640,
      1600
    ],
    "manufacturer": "Rollei",
    "formats": [
      "35mm",
      "120"
    ]
  },
  {
    "id": "rolleirpx100",
    "name": "Rollei RPX 100",
    "type": "B&W",
    "isos": [
      25,
      50,
      80,
      100,
      200,
      320,
      400,
      800,
      1000
    ],
    "manufacturer": "Rollei",
    "formats": [
      "35mm",
      "120"
    ]
  },
  {
    "id": "rolleirpx25",
    "name": "Rollei RPX 25",
    "type": "B&W",
    "isos": [
      12,
      20,
      25,
      32,
      50,
      80,
      100,
      200,
      320
    ],
    "manufacturer": "Rollei",
    "formats": [
      "35mm",
      "120",
      "sheet"
    ]
  },
  {
    "id": "rolleirpx400",
    "name": "Rollei RPX 400",
    "type": "B&W",
    "isos": [
      100,
      200,
      240,
      250,
      320,
      400,
      500,
      640,
      800,
      1000,
      1250,
      1600,
      3200,
      4000
    ],
    "manufacturer": "Rollei",
    "formats": [
      "35mm",
      "120",
      "sheet"
    ]
  },
  {
    "id": "rolleiretro400s",
    "name": "Rollei Retro 400S",
    "type": "B&W",
    "isos": [
      12,
      40,
      50,
      100,
      125,
      150,
      160,
      200,
      250,
      320,
      400,
      640,
      800,
      1000,
      1600
    ],
    "manufacturer": "Rollei",
    "formats": [
      "35mm",
      "120",
      "sheet"
    ]
  },
  {
    "id": "rolleiretro80s",
    "name": "Rollei Retro 80S",
    "type": "B&W",
    "isos": [
      20,
      25,
      40,
      50,
      64,
      65,
      75,
      80,
      100,
      160,
      200,
      320,
      400
    ],
    "manufacturer": "Rollei",
    "formats": [
      "35mm",
      "120"
    ]
  },
  {
    "id": "rolleisuperpan",
    "name": "Rollei Superpan",
    "type": "B&W",
    "isos": [
      12,
      40,
      50,
      80,
      100,
      125,
      160,
      200,
      250,
      320,
      400,
      640,
      800,
      1000,
      1600
    ],
    "manufacturer": "Rollei",
    "formats": [
      "35mm",
      "120"
    ]
  },
  {
    "id": "santarae1000",
    "name": "Santa RAE 1000",
    "type": "B&W",
    "isos": [
      200,
      400,
      800,
      1000,
      1600
    ],
    "manufacturer": "Santa",
    "formats": [
      "35mm"
    ]
  },
  {
    "id": "shanghaifilms",
    "name": "Shanghai films",
    "type": "B&W",
    "isos": [
      25,
      50,
      64,
      80,
      100,
      125,
      160,
      200,
      250,
      400,
      800,
      1600
    ],
    "manufacturer": "Shanghai",
    "formats": [
      "35mm",
      "120",
      "sheet"
    ]
  },
  {
    "id": "silberrafilms",
    "name": "Silberra films",
    "type": "B&W",
    "isos": [
      25,
      50,
      100,
      125,
      160,
      200,
      400
    ],
    "manufacturer": "Silberra",
    "formats": [
      "35mm"
    ]
  },
  {
    "id": "streetcandy",
    "name": "Street Candy",
    "type": "B&W",
    "isos": [
      400
    ],
    "manufacturer": "Street",
    "formats": [
      "35mm"
    ]
  },
  {
    "id": "svemafilms",
    "name": "Svema films",
    "type": "B&W",
    "isos": [
      0,
      1,
      3,
      6,
      12,
      25,
      32,
      50,
      64,
      100,
      125,
      160,
      200,
      320,
      400,
      640,
      800,
      1600,
      3200
    ],
    "manufacturer": "Svema",
    "formats": [
      "35mm",
      "120",
      "sheet"
    ]
  },
  {
    "id": "tasmafilms",
    "name": "Tasma films",
    "type": "B&W",
    "isos": [
      6,
      12,
      25,
      64,
      100,
      125,
      160,
      200,
      250,
      270,
      320,
      400,
      800,
      1600
    ],
    "manufacturer": "Tasma",
    "formats": [
      "35mm",
      "120",
      "sheet"
    ]
  },
  {
    "id": "typedfilms",
    "name": "Type-D films",
    "type": "B&W",
    "isos": [
      100,
      200,
      400
    ],
    "manufacturer": "Type-D",
    "formats": [
      "35mm"
    ]
  },
  {
    "id": "ultrafinefilms",
    "name": "Ultrafine films",
    "type": "B&W",
    "isos": [
      8,
      16,
      25,
      50,
      64,
      80,
      100,
      125,
      200,
      250,
      320,
      400,
      800,
      1600,
      3200
    ],
    "manufacturer": "Ultrafine",
    "formats": [
      "35mm",
      "120",
      "sheet"
    ]
  },
  {
    "id": "washifilms",
    "name": "Washi films",
    "type": "B&W",
    "isos": [
      3,
      6,
      12,
      25,
      50,
      100,
      400,
      500
    ],
    "manufacturer": "Washi",
    "formats": [
      "35mm",
      "120",
      "sheet"
    ]
  }
];

// Utility function to find a film by name
export function findFilmByName(name: string): Film | undefined {
  return films.find(film => 
    film.name === name || 
    film.alias?.includes(name)
  );
}

// Utility function to get available ISOs for a film
export function getFilmIsos(filmId: string): number[] {
  const film = films.find(f => f.id === filmId);
  return film?.isos || [];
}

// Utility function to get available formats for a film
export function getFilmFormats(filmId: string): ("35mm" | "120" | "sheet")[] {
  const film = films.find(f => f.id === filmId);
  return film?.formats || [];
}
