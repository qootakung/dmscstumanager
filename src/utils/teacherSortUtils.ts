
// Utility functions for sorting teachers by position hierarchy
const POSITION_ORDER = {
  // ผู้อำนวยการ
  'ผู้อำนวยการ': 1,
  'ผู้อำนวยการโรงเรียน': 1,
  
  // ครูวิทยฐานะชำนาญการพิเศษ
  'ครูวิทยฐานะชำนาญการพิเศษ': 2,
  'ครู วิทยฐานะครูชำนาญการพิเศษ': 2,
  'ครูชำนาญการพิเศษ': 2,
  
  // ครูวิทยฐานะชำนาญการ
  'ครูวิทยฐานะชำนาญการ': 3,
  'ครู วิทยฐานะครูชำนาญการ': 3,
  'ครูชำนาญการ': 3,
  
  // ครู
  'ครู': 4,
  'ครู ยังไม่มีวิทยฐานะ': 4,
  'ครูไม่มีวิทยฐานะ': 4,
  
  // ครูผู้ช่วย
  'ครูผู้ช่วย': 5,
  
  // ครูอัตราจ้าง
  'ครูอัตราจ้าง': 6,
  
  // ครูพี่เลี้ยงเด็กพิการ
  'ครูพี่เลี้ยงเด็กพิการ': 7,
  
  // นักการภารโรง
  'นักการภารโรง': 8,
  
  // เจ้าหน้าที่ธุรการ
  'เจ้าหน้าที่ธุรการ': 9,
};

export const getPositionOrder = (position: string): number => {
  // Check for exact match first
  if (POSITION_ORDER[position as keyof typeof POSITION_ORDER]) {
    return POSITION_ORDER[position as keyof typeof POSITION_ORDER];
  }
  
  // Clean the position string for better matching
  const cleanPosition = position?.trim().toLowerCase() || '';
  
  // Check for partial matches with more specific patterns
  if (cleanPosition.includes('ผู้อำนวยการ')) {
    return 1;
  }
  
  // Check for ครูชำนาญการพิเศษ (should come before regular ชำนาญการ)
  if (cleanPosition.includes('ชำนาญการพิเศษ') || cleanPosition.includes('ครูเชี่ยวชาญพิเศษ')) {
    return 2;
  }
  
  // Check for ครูชำนาญการ
  if (cleanPosition.includes('ชำนาญการ') || cleanPosition.includes('ครูเชี่ยวชาญ')) {
    return 3;
  }
  
  // Check for ครูผู้ช่วย (should come before regular ครู)
  if (cleanPosition.includes('ครูผู้ช่วย')) {
    return 5;
  }
  
  // Check for ครูอัตราจ้าง
  if (cleanPosition.includes('อัตราจ้าง')) {
    return 6;
  }
  
  // Check for ครูพี่เลี้ยงเด็กพิการ
  if (cleanPosition.includes('พี่เลี้ยง') || cleanPosition.includes('เด็กพิการ')) {
    return 7;
  }
  
  // Check for นักการภารโรง
  if (cleanPosition.includes('ภารโรง')) {
    return 8;
  }
  
  // Check for เจ้าหน้าที่ธุรการ
  if (cleanPosition.includes('ธุรการ')) {
    return 9;
  }
  
  // Check for regular ครู (after checking for ครูผู้ช่วย)
  if (cleanPosition.includes('ครู') && !cleanPosition.includes('ผู้ช่วย')) {
    return 4;
  }
  
  // Default to end of list for unknown positions
  return 999;
};

export const sortTeachersByPosition = (teachers: any[]) => {
  return teachers.sort((a, b) => {
    const aOrder = getPositionOrder(a.position || '');
    const bOrder = getPositionOrder(b.position || '');
    
    if (aOrder !== bOrder) {
      return aOrder - bOrder;
    }
    
    // If same position order, sort by positionNumber
    const aNum = parseInt(a.positionNumber) || 0;
    const bNum = parseInt(b.positionNumber) || 0;
    
    if (aNum !== bNum) {
      return aNum - bNum;
    }
    
    // If same positionNumber, sort by name
    const aName = `${a.firstName || ''} ${a.lastName || ''}`.trim();
    const bName = `${b.firstName || ''} ${b.lastName || ''}`.trim();
    return aName.localeCompare(bName, 'th');
  });
};
