export interface Caste {
  name: string;
  subCastes: string[];
}

export interface Religion {
  name: string;
  castes: Caste[];
}

export const indianReligions: Religion[] = [
  {
    name: 'Hindu',
    castes: [
      {
        name: 'Brahmin',
        subCastes: ['Saraswat', 'Iyer', 'Iyengar', 'Kanyakubj', 'Gaur', 'Bhumihar', 'Deshastha', 'Smartha', 'Madhva']
      },
      {
        name: 'Rajput',
        subCastes: ['Chauhan', 'Rathore', 'Parmar', 'Sisodia', 'Bhati', 'Tomar', 'Kachwaha']
      },
      {
        name: 'Baniya / Vaishya',
        subCastes: ['Agarwal', 'Gupta', 'Garg', 'Oswal', 'Khandelwal', 'Porwal', 'Maheshwari']
      },
      {
        name: 'Yadav / Ahir',
        subCastes: ['Ahir', 'Gwala', 'Sadgop', 'Gavli']
      },
      {
        name: 'Kayastha',
        subCastes: ['Srivastava', 'Mathur', 'Saxena', 'Bhatnagar', 'Asthana', 'Sinha']
      },
      {
        name: 'Maratha',
        subCastes: ['96 Kuli', 'Deshmukh', 'Patil']
      },
      {
        name: 'Jat',
        subCastes: ['Hindu Jat']
      },
      {
        name: 'Reddy',
        subCastes: ['Motati', 'Pokanati', 'Pedakanti']
      },
      {
        name: 'Patel',
        subCastes: ['Leuva', 'Kadva']
      },
      {
        name: 'Scheduled Caste (SC)',
        subCastes: ['Mahar', 'Chamar', 'Valmiki']
      },
      {
        name: 'Scheduled Tribe (ST)',
        subCastes: ['Gond', 'Bhil', 'Santhal']
      },
      {
        name: 'Other Backward Class (OBC)',
        subCastes: ['Kurmi', 'Koeri', 'Lodhi']
      }
    ]
  },
  {
    name: 'Muslim',
    castes: [
      {
        name: 'Sunni',
        subCastes: ['Ansari', 'Qureshi', 'Sheikh', 'Syed', 'Pathan']
      },
      {
        name: 'Shia',
        subCastes: ['Syed', 'Khoja', 'Dawoodi Bohra']
      }
    ]
  },
  {
    name: 'Sikh',
    castes: [
      {
        name: 'Jat',
        subCastes: ['Gill', 'Sandhu', 'Dhillon', 'Grewal', 'Sidhu']
      },
      {
        name: 'Khatri',
        subCastes: ['Bedi', 'Sodhi', 'Trehan', 'Bhalla']
      },
      {
        name: 'Arora',
        subCastes: ['Arora']
      },
      {
        name: 'Ramgarhia',
        subCastes: ['Matharu', 'Virdi', 'Bhamra']
      }
    ]
  },
  {
    name: 'Christian',
    castes: [
      {
        name: 'Catholic',
        subCastes: ['Goan Catholic', 'Mangalorean Catholic', 'Syro-Malabar', 'Latin Catholic']
      },
      {
        name: 'Protestant',
        subCastes: ['CSI', 'CNI', 'Baptist', 'Methodist', 'Pentecostal']
      },
      {
        name: 'Orthodox',
        subCastes: ['Syrian Orthodox', 'Jacobite']
      }
    ]
  },
  {
    name: 'Jain',
    castes: [
      {
        name: 'Digambar',
        subCastes: ['Bisapanthi', 'Terapanthi', 'Taranpanthi']
      },
      {
        name: 'Shwetambar',
        subCastes: ['Murtipujaka', 'Sthanakvasi', 'Terapanthi']
      }
    ]
  },
  {
    name: 'Buddhist',
    castes: [
      {
        name: 'Neo-Buddhist / Navayana',
        subCastes: ['Mahar']
      },
      {
        name: 'Theravada',
        subCastes: ['Chakma', 'Barua']
      }
    ]
  },
  {
    name: 'Parsi / Zoroastrian',
    castes: [
      {
        name: 'Parsi',
        subCastes: ['Shenshai', 'Kadmi', 'Fasli']
      }
    ]
  }
];
