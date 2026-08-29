/**
 * VNPT HIS Auto-Fill KSK - Content Script & In-Page Floating Widget
 * Google AI Studio Exact 100% Pixel-Perfect Replica + Robust Automation Engine
 * Manifest V3 Extension for https://*.vnpthis.vn/ (World: MAIN)
 */

(function () {
  if (window.hasVNPTAutoFillInjected) return;
  window.hasVNPTAutoFillInjected = true;

  // -------------------------------------------------------------
  // 1. DEFAULT SETTINGS & STORAGE
  // -------------------------------------------------------------
  const DEFAULT_SETTINGS = {
    phong_kham_id: "3",
    phong_kham_name: "PHÒNG KHÁM SỨC KHOẺ",
    dich_vu_id: "1223",
    dich_vu_name: "Khám kiểm tra sức khỏe [dưới 18 tuổi]",
    doi_tuong_tt25: "Học sinh trong các cơ sở giáo dục phổ thông",
    nguon_chi_tra_tt25: "Khác",
    ly_do_kham_tt25: "khám sức khỏe định kì",
    bac_si_mac_dinh: "Nông Thị Luyến"
  };

  const ANONYMIZED_GEMINI_PROMPT = `# PROMPT OCR HỒ SƠ KHÁM SỨC KHỎE HỌC SINH (DƯỚI 18 TUỔI)

Bạn là chuyên gia OCR y tế hàng đầu. Hãy đọc toàn bộ thông tin từ ảnh chụp phiếu khám sức khỏe định kỳ học sinh (mẫu dưới 18 tuổi TT25/TT32) và xuất ra định dạng JSON chính xác 100%.

---

## QUY TẮC BÓC TÁCH DỮ LIỆU:

1. Hành chính: Họ tên viết hoa (in hoa), ngày sinh (DD/MM/YYYY), CCCD, ngày cấp, nơi cấp, dân tộc, nghề nghiệp (Học sinh).
2. Địa chỉ: Lấy đầy đủ cả chuỗi và tách phuong_xa (ví dụ: Phường Hợp Giang), tinh (Cao Bằng).
3. Người thân: Họ tên mẹ/bố/người giám hộ, mối quan hệ (ME / CHA / ONG_BA / ANH_CHI / QH_KHAC).
4. Tiêm chủng (Rất quan trọng): Đọc kỹ từng hàng xem dấu tích V (✓ hoặc X) nằm ở cột nào:
   - Cột 1 (Có) -> "Có"
   - Cột 2 (Không) -> "Không"
   - Cột 3 (Không nhớ) -> "Không nhớ"
   - Nếu hàng nào để trống không tích -> ""
5. Tiền sử bệnh tật:
   - Tiền sử gia đình: Đọc dấu tích Không hoặc Có (kèm tên bệnh nếu có).
   - Sản khoa: Bình thường hoặc ghi cụ thể.
   - Bệnh bẩm sinh/mãn tính: Đọc dấu tích Không hoặc Có.
   - Đang điều trị: Đọc dấu tích Không hoặc Có.
6. Thể lực & Sinh hiệu: Chiều cao, Cân nặng, BMI, Huyết áp, Mạch, Phân loại thể lực (Loại I / Loại II...).
7. Lâm sàng & Phân loại:
   - Tuần hoàn, Hô hấp, Tiêu hóa, Thận tiết niệu, Thần kinh, Tâm thần, TMH, RHM: Nếu bình thường ghi "Bình thường" và phân loại "Loại I". Nếu không khám/không ghi thì để trống.
   - Mắt: Thị lực có kính/không kính. Nếu có cận thị hoặc đeo kính thì phân loại "Loại II", nếu 10/10 bình thường thì "Loại I".
   - Lưu ý quan trọng: Bỏ qua 2 mục không bắt buộc là Khám lâm sàng khác và Khám cận lâm sàng (để trống 100%).
8. Kết luận: Tình trạng sức khỏe (ví dụ: Bình thường hoặc Cận thị), Phân loại sức khỏe chung (Loại I hoặc Loại II).

---

## CẤU TRÚC JSON ĐẦU RA MẪU:

\`\`\`json
{
  "thong_tin_chung": {
    "ho_ten": "NGUYỄN VĂN A",
    "ngay_sinh": "15/05/2010",
    "gioi_tinh": "Nam",
    "cccd": "004210001234",
    "dan_toc": "Kinh",
    "nghe_nghiep": "Học sinh",
    "so_dien_thoai": "",
    "ngay_cap_cccd": "10/05/2024",
    "noi_cap_cccd": "Bộ Công An"
  },
  "dia_chi": {
    "day_du": "Số 123 đường Hoàng Đình Giong, phường Hợp Giang",
    "phuong_xa": "Phường Hợp Giang",
    "tinh": "Cao Bằng"
  },
  "nguoi_lien_he": {
    "nguoi_giam_ho": "TRẦN THỊ B",
    "ho_ten_bo": null,
    "ho_ten_me": "TRẦN THỊ B",
    "moi_quan_he": "ME"
  },
  "tiem_chung": {
    "bcg": "Có",
    "bach_hau_ho_ga_uon_van": "Có",
    "soi": "Có",
    "bai_liet": "Có",
    "viem_nao_nhat_ban_b": "",
    "viem_gan_b": "Có",
    "cac_loai_khac": "Không nhớ"
  },
  "tien_su": {
    "tien_su_gia_dinh": "Không",
    "san_khoa": "Bình thường",
    "benh_bam_sinh_man_tinh": "Không",
    "ten_benh_bam_sinh": "",
    "dang_dieu_tri_benh": "Không",
    "ten_benh_dang_dieu_tri": ""
  },
  "sinh_hieu": {
    "chieu_cao": "155,0",
    "can_nang": "48,0",
    "bmi": "20,0",
    "mach": "75",
    "huyet_ap": "100/65",
    "phan_loai": "Loại I"
  },
  "kham_lam_sang": {
    "tuan_hoan": "Bình thường",
    "tuan_hoan_phan_loai": "Loại I",
    "ho_hap": "Bình thường",
    "ho_hap_phan_loai": "Loại I",
    "tieu_hoa": "Bình thường",
    "tieu_hoa_phan_loai": "Loại I",
    "than_tiet_nieu": "Bình thường",
    "than_tiet_nieu_phan_loai": "Loại I",
    "than_kinh": "Bình thường",
    "than_kinh_phan_loai": "Loại I",
    "tam_than": "Bình thường",
    "tam_than_phan_loai": "Loại I"
  },
  "mat": {
    "khong_kinh_mp": "",
    "khong_kinh_mt": "",
    "co_kinh_mp": "10/10",
    "co_kinh_mt": "10/10",
    "benh_ve_mat": "",
    "phan_loai": "Loại II"
  },
  "tai_mui_hong": {
    "tai_trai_noi_thuong": "5",
    "tai_trai_noi_tham": "0,5",
    "tai_phai_noi_thuong": "5",
    "tai_phai_noi_tham": "0,5",
    "benh_tai_mui_hong": "Bình thường",
    "phan_loai": "Loại I"
  },
  "rang_ham_mat": {
    "ham_tren": "Bình thường",
    "ham_duoi": "Bình thường",
    "benh_ve_rang": "Bình thường",
    "phan_loai": "Loại I"
  },
  "ket_luan": {
    "phan_loai_suc_khoe": "Loại II",
    "tinh_trang_suc_khoe": "Cận thị"
  }
}
\`\`\``;

  let currentSettings = { ...DEFAULT_SETTINGS };
  let executionLogs = [];

  function logAction(step, message, type = "info") {
    const time = new Date().toLocaleTimeString("vi-VN");
    executionLogs.unshift({ id: Date.now(), timestamp: time, step, message, type });
    if (executionLogs.length > 50) executionLogs.pop();
    updateLogsView();
  }

  function loadSettings(callback) {
    try {
      const stored = localStorage.getItem("vnpt_rpa_settings");
      if (stored) {
        currentSettings = { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
      }
    } catch (e) {}
    if (callback) callback(currentSettings);
  }

  function saveSettings(newSettings, callback) {
    currentSettings = { ...currentSettings, ...newSettings };
    try {
      localStorage.setItem("vnpt_rpa_settings", JSON.stringify(currentSettings));
    } catch (e) {}
    if (callback) callback();
  }

  // -------------------------------------------------------------
  // 2. DOM UTILITIES & EVENT HELPERS
  // -------------------------------------------------------------
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  function triggerEnter(element) {
    if (!element) return;
    element.focus();

    if (window.jQuery) {
      const $el = window.$(element);
      const eDown = window.$.Event("keydown", { which: 13, keyCode: 13, key: "Enter", code: "Enter", charCode: 13 });
      const ePress = window.$.Event("keypress", { which: 13, keyCode: 13, key: "Enter", code: "Enter", charCode: 13 });
      const eUp = window.$.Event("keyup", { which: 13, keyCode: 13, key: "Enter", code: "Enter", charCode: 13 });

      $el.trigger(eDown);
      $el.trigger(ePress);
      $el.trigger(eUp);
      $el.trigger("change");

      try {
        const events = window.$._data(element, "events");
        if (events) {
          if (events.keypress) events.keypress.forEach((h) => h.handler && h.handler.call(element, ePress));
          if (events.keydown) events.keydown.forEach((h) => h.handler && h.handler.call(element, eDown));
        }
      } catch (err) {}
    }

    ["keydown", "keypress", "keyup"].forEach((eventType) => {
      const evt = new KeyboardEvent(eventType, {
        key: "Enter",
        code: "Enter",
        keyCode: 13,
        which: 13,
        charCode: 13,
        bubbles: true,
        cancelable: true,
        composed: true
      });
      element.dispatchEvent(evt);
    });
  }

  function safeSetInput(elementId, value) {
    if (value === undefined || value === null || String(value).trim() === "") return;
    const el = document.getElementById(elementId) || document.querySelector(elementId);
    if (!el) return;
    if (el.disabled) el.removeAttribute("disabled");
    el.value = String(value);
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
    if (window.jQuery && window.$(el).length) {
      window.$(el).val(String(value)).trigger("input").trigger("change");
    }
  }

  function safeClearInput(elementId) {
    const el = document.getElementById(elementId) || document.querySelector(elementId);
    if (!el) return;
    if (el.disabled) el.removeAttribute("disabled");
    el.value = "";
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
    if (window.jQuery && window.$(el).length) {
      window.$(el).val("").trigger("input").trigger("change");
    }
  }

  function safeSelectOption(elementId, expectedText) {
    if (!expectedText) return;
    const el = document.getElementById(elementId) || document.querySelector(elementId);
    if (!el || !el.options) return;
    if (el.disabled) el.removeAttribute("disabled");
    const target = expectedText.toLowerCase().trim();
    for (let i = 0; i < el.options.length; i++) {
      const opt = el.options[i];
      const optText = opt.text.toLowerCase().trim();
      if (optText.indexOf(target) !== -1 || target.indexOf(optText) !== -1) {
        el.selectedIndex = i;
        el.value = opt.value;
        el.dispatchEvent(new Event("change", { bubbles: true }));
        if (window.jQuery && window.$(el).length) {
          window.$(el).val(opt.value).trigger("change");
        }
        return opt.text;
      }
    }
  }

  function safeClickRadio(name, value) {
    if (value === undefined || value === null) return;
    const el = document.querySelector(`input[name='${name}'][value='${value}']`);
    if (el) {
      el.checked = true;
      el.dispatchEvent(new Event("click", { bubbles: true }));
      el.dispatchEvent(new Event("change", { bubbles: true }));
      if (window.jQuery && window.$(el).length) {
        window.$(el).prop("checked", true).trigger("click").trigger("change");
      }
    }
  }

  function safeSelect2(elementId, searchKeyword) {
    if (!searchKeyword) return;
    const target = searchKeyword.toLowerCase().trim();
    const select = document.getElementById(elementId);
    if (!select) return;

    if (select.disabled) select.removeAttribute("disabled");

    let foundVal = null;
    let foundText = null;

    for (let i = 0; i < select.options.length; i++) {
      const opt = select.options[i];
      const txt = opt.text.toLowerCase().trim();
      const cleanTarget = target.replace(/^(phường|xã|thị trấn)\s+/i, "").trim();
      const cleanTxt = txt.replace(/^(phường|xã|thị trấn)\s+/i, "").trim();

      if (txt.indexOf(target) !== -1 || cleanTxt.indexOf(cleanTarget) !== -1 || target.indexOf(cleanTxt) !== -1) {
        foundVal = opt.value;
        foundText = opt.text;
        break;
      }
    }

    if (foundVal) {
      select.value = foundVal;
      select.dispatchEvent(new Event("change", { bubbles: true }));
      
      if (window.jQuery) {
        const $el = window.$(`#${elementId}`);
        $el.val(foundVal).trigger("change");
        try {
          $el.select2("val", foundVal);
        } catch (e) {}
      }

      const container = document.getElementById(`select2-${elementId}-container`);
      if (container && foundText) {
        container.textContent = foundText;
        container.title = foundText;
      }
    }
  }

  function mapRadioVal(valStr) {
    if (valStr === undefined || valStr === null) return null;
    const s = String(valStr).toLowerCase().trim();
    if (["có", "co", "1", "true", "yes"].includes(s)) return "1";
    if (["không", "khong", "0", "false", "no"].includes(s)) return "0";
    if (s.includes("không nhớ") || s.includes("khong nho") || s === "2") return "2";
    return null;
  }

  // -------------------------------------------------------------
  // 3. DYNAMIC DATA EXTRACTION FROM WEB PAGE
  // -------------------------------------------------------------
  function extractDoctorsFromPage() {
    const selects = document.querySelectorAll("select[id*='bacsi']:not([id*='dantoc']):not([id*='nghe'])");
    const found = [];
    const seen = {};
    
    for (let i = 0; i < selects.length; i++) {
      const s = selects[i];
      if (s.options && s.options.length > 1) {
        for (let j = 0; j < s.options.length; j++) {
          const opt = s.options[j];
          const val = opt.value;
          const txt = opt.text.trim();
          
          if (
            val &&
            val !== "0" &&
            val !== "" &&
            txt &&
            !txt.toLowerCase().includes("chọn bác sĩ") &&
            !["kinh", "tày", "thái", "hoa", "khmer", "mường", "nùng", "mông", "dao"].includes(txt.toLowerCase())
          ) {
            if (!seen[val]) {
              seen[val] = true;
              found.push({ value: val, name: txt });
            }
          }
        }
        if (found.length > 0) break;
      }
    }
    return found;
  }

  function extractClinicsFromPage() {
    const s = document.getElementById("cbphongkham");
    const found = [];
    if (s && s.options && s.options.length > 0) {
      for (let i = 0; i < s.options.length; i++) {
        const opt = s.options[i];
        const val = opt.value;
        const txt = opt.text.trim();
        if (val && txt) {
          const mId = txt.match(/^(\d+)/);
          const numId = mId ? mId[1] : (i + 1);
          found.push({ id: String(numId), name: txt });
        }
      }
    }
    if (found.length === 0) {
      return [
        { id: "3", name: "3 - PHÒNG KHÁM SỨC KHOẺ" },
        { id: "1", name: "1 - PHÒNG KHÁM" },
        { id: "2", name: "2 - PHÒNG KHÁM METHADONE" }
      ];
    }
    return found;
  }

  function extractServicesFromPage() {
    const s = document.getElementById("cbdichvu");
    const found = [];
    if (s && s.options && s.options.length > 0) {
      for (let i = 0; i < s.options.length; i++) {
        const opt = s.options[i];
        const val = opt.value;
        const txt = opt.text.trim();
        if (val && txt && val !== "0") {
          found.push({ id: String(val), name: txt });
        }
      }
    }
    if (found.length === 0) {
      return [
        { id: "1223", name: "1223 - Khám kiểm tra sức khỏe [dưới 18 tuổi]" },
        { id: "1224", name: "1224 - Khám kiểm tra sức khỏe [đủ 18 tuổi]" },
        { id: "1220", name: "1220 - Khám bệnh tại Trạm Y tế xã và đơn vị tương đương" },
        { id: "1221", name: "1221 - Khám sức khoẻ cộng đồng" },
        { id: "2", name: "2 - Không tính công khám" }
      ];
    }
    return found;
  }

  function extractDoiTuongFromPage() {
    const s = document.getElementById("tt32_mau1kskdoituong");
    const found = [];
    if (s && s.options && s.options.length > 0) {
      for (let i = 0; i < s.options.length; i++) {
        const opt = s.options[i];
        const val = opt.value;
        const txt = opt.text.trim();
        if (val && txt && !txt.includes("Chọn đối tượng")) {
          found.push({ id: String(val), name: txt });
        }
      }
    }
    if (found.length === 0) {
      return [
        { id: "11", name: "Học sinh trong các cơ sở giáo dục phổ thông" },
        { id: "10", name: "Trẻ em trong cơ sở giáo dục mầm non" },
        { id: "12", name: "Sinh viên" },
        { id: "13", name: "Người lao động" },
        { id: "1", name: "Người cao tuổi" },
        { id: "2", name: "Người khuyết tật" },
        { id: "3", name: "Người thuộc hộ nghèo, cận nghèo" },
        { id: "4", name: "Người có công" },
        { id: "5", name: "Người mắc bệnh mạn tính" },
        { id: "16", name: "Các đối tượng khác" }
      ];
    }
    return found;
  }

  function extractNguonChiTraFromPage() {
    const s = document.getElementById("tt32_mau1ksknguonchitra");
    const found = [];
    if (s && s.options && s.options.length > 0) {
      for (let i = 0; i < s.options.length; i++) {
        const opt = s.options[i];
        const val = opt.value;
        const txt = opt.text.trim();
        if (val && txt && !txt.includes("Chọn nguồn")) {
          found.push({ id: String(val), name: txt });
        }
      }
    }
    if (found.length === 0) {
      return [
        { id: "9", name: "Khác" },
        { id: "3", name: "Quỹ Bảo hiểm y tế" },
        { id: "2", name: "Ngân sách Địa phương" },
        { id: "1", name: "Ngân sách Trung ương" },
        { id: "4", name: "Người sử dụng lao động" },
        { id: "5", name: "Xã hội hóa" }
      ];
    }
    return found;
  }

  function autofillDoctorToAllSpecialties(doctorValue) {
    if (!doctorValue) return 0;
    // LOẠI TRỪ TUYỆT ĐỐI LÂM SÀNG KHÁC VÀ CẬN LÂM SÀNG
    const selects = document.querySelectorAll(
      "select[id^='tt32'][id*='bacsi']:not([id*='dantoc']):not([id*='nghe']):not([id*='lamsangkhac']):not([id*='khac']):not([id*='cls']):not([id*='canlam'])"
    );
    let count = 0;
    
    for (let i = 0; i < selects.length; i++) {
      const s = selects[i];
      if (s.disabled) s.removeAttribute("disabled");
      
      let docName = "";
      for (let o = 0; o < s.options.length; o++) {
        if (s.options[o].value === String(doctorValue)) {
          s.selectedIndex = o;
          s.value = String(doctorValue);
          docName = s.options[o].text.trim();
          break;
        }
      }

      s.dispatchEvent(new Event("change", { bubbles: true }));

      if (window.jQuery) {
        const $s = window.$(s);
        $s.val(String(doctorValue));
        $s.trigger("change");
        $s.trigger("chosen:updated");
        $s.trigger("liszt:updated");
        
        if (docName) {
          $s.next(".chosen-container").find(".chosen-single span").text(docName);
          $s.parent().find(".chosen-container .chosen-single span").text(docName);
        }
      }
      count++;
    }

    // ĐẢM BẢO BÁC SĨ MỤC LÂM SÀNG KHÁC VÀ CẬN LÂM SÀNG ĐỂ TRỐNG (CHƯA KHÁM)
    const optionalDocSelects = document.querySelectorAll(
      "select[id*='lamsangkhac'], select[id*='bacsikhac'], select[id*='bacsicls'], select[id*='canlamsang']"
    );
    optionalDocSelects.forEach((s) => {
      s.selectedIndex = 0;
      s.value = "";
      s.dispatchEvent(new Event("change", { bubbles: true }));
      if (window.jQuery) {
        const $s = window.$(s);
        $s.val("");
        $s.trigger("change");
        $s.trigger("chosen:updated");
        $s.trigger("liszt:updated");
        $s.next(".chosen-container").find(".chosen-single span").text("Chọn bác sĩ");
        $s.parent().find(".chosen-container .chosen-single span").text("Chọn bác sĩ");
      }
    });

    return count;
  }

  // -------------------------------------------------------------
  // 4. STEP 1: TIẾP NHẬN NGOẠI TRÚ
  // -------------------------------------------------------------
  async function runStep1TiepNhan(patientData, settings, updateStatus) {
    updateStatus("info", "▶ Đang thực hiện Bước 1: Tiếp nhận...");
    logAction(1, "Bắt đầu Tiếp nhận bệnh nhân: " + (patientData?.thong_tin_chung?.ho_ten || ""), "info");

    const tt = patientData.thong_tin_chung || {};
    const dc = patientData.dia_chi || {};
    const lh = patientData.nguoi_lien_he || {};

    const themBtn = document.getElementById("themmoi");
    if (themBtn) {
      themBtn.click();
      await sleep(500);
    }

    const cccd = tt.cccd;
    if (cccd) {
      const elemCccd = document.getElementById("socmt");
      if (elemCccd) {
        if (elemCccd.disabled) elemCccd.removeAttribute("disabled");
        elemCccd.focus();
        elemCccd.value = cccd;
        
        if (window.jQuery) {
          window.$("#socmt").val(cccd).trigger("input").trigger("change");
        } else {
          elemCccd.dispatchEvent(new Event("input", { bubbles: true }));
          elemCccd.dispatchEvent(new Event("change", { bubbles: true }));
        }

        updateStatus("info", `-> Đang gửi ENTER cho CCCD: ${cccd}...`);
        triggerEnter(elemCccd);
        await sleep(600);
        triggerEnter(elemCccd);

        updateStatus("info", "⏳ Đang đợi BHYT tải dữ liệu về...");
        for (let w = 0; w < 10; w++) {
          await sleep(500);
          const loading = document.getElementById("loadingIn4The");
          if (loading && loading.style.display === "none" && w >= 6) {
            break;
          }
        }
      }
    }

    const applyAllFields = () => {
      safeSetInput("hoten", tt.ho_ten);
      safeSetInput("namsinh", tt.ngay_sinh);
      safeSelectOption("cbgioitinh", tt.gioi_tinh || "Nữ");
      
      if (tt.dan_toc) {
        safeSelectOption("cbdantoc", tt.dan_toc);
      }
      safeSelectOption("cbnghenghiep", tt.nghe_nghiep || "Học sinh");
      safeSelectOption("cbquoctich", "Việt Nam");

      if (tt.so_dien_thoai) {
        safeSetInput("sdt", tt.so_dien_thoai);
      }

      const diaChiDayDu = dc.day_du || "";
      let phuongXa = dc.phuong_xa || "";
      if (!phuongXa && diaChiDayDu) {
        const m = diaChiDayDu.match(/(phường|xã|thị trấn)\s+([^,]+)/i);
        if (m) phuongXa = m[0].trim();
      }
      if (phuongXa) {
        safeSelect2("maxa_cu_tru", phuongXa);
      }
      if (diaChiDayDu) {
        safeSetInput("diachi", diaChiDayDu);
      }

      const tenNguoiLh = lh.nguoi_giam_ho || lh.ho_ten_me || lh.ho_ten_cha;
      if (tenNguoiLh) safeSetInput("nguoilienhe", tenNguoiLh);
      if (lh.ho_ten_cha) safeSetInput("ho_ten_cha", lh.ho_ten_cha);
      if (lh.ho_ten_me) safeSetInput("ho_ten_me", lh.ho_ten_me);

      safeSetInput("phongkham", settings.phong_kham_id || "3");
      safeSelectOption("cbphongkham", settings.phong_kham_name || "PHÒNG KHÁM SỨC KHOẺ");
      safeSetInput("dichvu", settings.dich_vu_id || "1223");
      safeSelectOption("cbdichvu", settings.dich_vu_name || "Khám kiểm tra sức khỏe [dưới 18 tuổi]");
    };

    applyAllFields();
    await sleep(800);
    applyAllFields();

    logAction(1, "✅ Đã điền xong Tiếp nhận & chỉnh đúng Phường/Xã.", "success");
    updateStatus("success", "✅ Đã điền xong Tiếp nhận & chỉnh đúng Phường/Xã! Hãy kiểm tra và tự bấm nút [LƯU].");
  }

  // -------------------------------------------------------------
  // 5. STEP 2: KHÁM BỆNH NGOẠI TRÚ (TT25)
  // -------------------------------------------------------------
  async function runStep2KhamBenh(patientData, settings, selectedDoctorVal, updateStatus) {
    updateStatus("info", "▶ Đang mở phiếu & điền Khám bệnh TT25...");
    logAction(2, "Bắt đầu mở phiếu & điền Khám bệnh TT25", "info");

    const btnKsk = document.getElementById("khamsuckhoetheodoituong");
    if (btnKsk && (!document.getElementById("tt32_mau1ksk_tab1") || document.getElementById("tt32_mau1ksk_tab1").offsetParent === null)) {
      btnKsk.click();
      await sleep(1000);
    }

    let docVal = selectedDoctorVal;
    if (!docVal) {
      const selectElem = document.getElementById("vnpt-doctor-select");
      if (selectElem && selectElem.value) {
        docVal = selectElem.value;
      }
    }
    if (!docVal) {
      const docs = extractDoctorsFromPage();
      if (docs.length > 0) {
        let prefDoc = docs.find((d) => settings.bac_si_mac_dinh && d.name.includes(settings.bac_si_mac_dinh));
        docVal = prefDoc ? prefDoc.value : docs[0].value;
      }
    }

    const tt = patientData.thong_tin_chung || {};
    const dc = patientData.dia_chi || {};
    const lh = patientData.nguoi_lien_he || {};
    const tc = patientData.tiem_chung || {};
    const ts = patientData.tien_su || {};
    const sh = patientData.sinh_hieu || {};
    const ls = patientData.kham_lam_sang || {};
    const mat = patientData.mat || {};
    const tmh = patientData.tai_mui_hong || {};
    const rhm = patientData.rang_ham_mat || {};
    const kl = patientData.ket_luan || {};

    // TAB 1: THÔNG TIN & TIỀN SỬ
    const tab1 = document.getElementById("tt32_mau1ksk_tab1");
    if (tab1) tab1.click();
    await sleep(200);

    safeSelectOption("tt32_mau1kskgioitinh", tt.gioi_tinh || "Nữ");
    safeSetInput("tt32_mau1ksksocmnd", tt.cccd);
    safeSetInput("tt32_mau1kskngaycapcmnd", tt.ngay_cap_cccd || "07/05/2024");
    safeSetInput("tt32_mau1ksknoicapcmnd", tt.noi_cap_cccd || "Bộ Công An");
    safeSelectOption("tt32_mau1kskdoituong", settings.doi_tuong_tt25 || "Học sinh trong các cơ sở giáo dục phổ thông");
    safeSelectOption("tt32_mau1ksknguonchitra", settings.nguon_chi_tra_tt25 || "Khác");

    const tenLh = lh.nguoi_giam_ho || lh.ho_ten_me || lh.ho_ten_cha || "";
    safeSetInput("tt32_mau1kskhotennguoinha", tenLh);
    const moiQh = lh.moi_quan_he || (lh.ho_ten_me ? "ME" : (lh.ho_ten_bo ? "CHA" : "ME"));
    safeClickRadio("tt32_mau1kskmoiquanhe", moiQh);

    safeSetInput("tt32_mau1kskdiachi", dc.day_du);
    safeSetInput("tt32_mau1ksklydo", settings.ly_do_kham_tt25 || "khám sức khỏe định kì");
    safeSelectOption("tt32_mau1gdmacbenhtruyennhiem", ts.tien_su_gia_dinh || "Không");
    safeSetInput("tt32_mau1btkhongbinhthuong", ts.san_khoa || "Bình thường");

    const vacxinMapping = {
      bcg: ["tt32_mau1_rdgroup_vacxinbgc"],
      bach_hau_ho_ga_uon_van: ["tt32_mau1_rdgroup_vacxinbachhau"],
      soi: ["tt32_mau1_rdgroup_vacxinsoi"],
      bai_liet: ["tt32_mau1_rdgroup_vacxinbachau", "tt32_mau1_rdgroup_vacxinbailiet"],
      viem_nao_nhat_ban_b: ["tt32_mau1_rdgroup_vacxinviemnaonhatban", "tt32_mau1_rdgroup_vacxinvnnhatban"],
      viem_gan_b: ["tt32_mau1_rdgroup_vacxinviemganb"],
      cac_loai_khac: ["tt32_mau1_rdgroup_vacxinkhac"]
    };

    for (const [key, radios] of Object.entries(vacxinMapping)) {
      const val = mapRadioVal(tc[key]);
      if (val !== null) {
        radios.forEach((r) => safeClickRadio(r, val));
      }
    }

    const valBamsinh = mapRadioVal(ts.benh_bam_sinh_man_tinh || "Không");
    if (valBamsinh !== null) {
      safeClickRadio("tt32_mau1_rdgroup_benhbamsinh", valBamsinh);
      safeClickRadio("tt32_mau1_RadioGroup_benhtatbanthan", valBamsinh);
    }

    // TAB 2: THỂ LỰC
    const tab2 = document.getElementById("tt32_mau1ksk_tab2");
    if (tab2) tab2.click();
    await sleep(200);

    safeSetInput("tt32_mau1chieucao", sh.chieu_cao || "155,0");
    safeSetInput("tt32_mau1cannang", sh.can_nang || "48,0");
    safeSetInput("tt32_mau1bmi", sh.bmi || "20,0");
    const ha = String(sh.huyet_ap || "100/65");
    const [haCao, haThap] = ha.includes("/") ? ha.split("/") : ["100", "65"];
    safeSetInput("tt32_mau1kskhuyetapcao", haCao.trim());
    safeSetInput("tt32_mau1kskhuyetapthap", haThap.trim());
    safeSetInput("tt32_mau1kskmach", sh.mach || "75");
    safeSelectOption("tt32_mau1phanloaitheluc", sh.phan_loai || "Loại I");

    // TAB 3: LÂM SÀNG
    const tab3 = document.getElementById("tt32_mau1ksk_tab3");
    if (tab3) tab3.click();
    await sleep(200);

    safeSetInput("tt32_mau1tuanhoan", ls.tuan_hoan || "Bình thường");
    safeSelectOption("tt32_mau1tuanhoanphanloai", ls.tuan_hoan_phan_loai || "Loại I");

    safeSetInput("tt32_mau1hohap", ls.ho_hap || "Bình thường");
    safeSelectOption("tt32_mau1hohapphanloai", ls.ho_hap_phan_loai || "Loại I");

    safeSetInput("tt32_mau1tieuhoa", ls.tieu_hoa || "Bình thường");
    safeSelectOption("tt32_mau1tieuhoaphanloai", ls.tieu_hoa_phan_loai || "Loại I");

    safeSetInput("tt32_mau1tietnieu", ls.than_tiet_nieu || "Bình thường");
    safeSelectOption("tt32_mau1tietnieuphanloai", ls.than_tiet_nieu_phan_loai || "Loại I");

    safeSetInput("tt32_mau1thankinh", ls.than_kinh || "Bình thường");
    safeSelectOption("tt32_mau1thankinhphanloai", ls.than_kinh_phan_loai || "Loại I");

    safeSetInput("tt32_mau1tamthan", ls.tam_than || "Bình thường");
    safeSelectOption("tt32_mau1tamthanphanloai", ls.tam_than_phan_loai || "Loại I");

    // G) KHÁM LÂM SÀNG KHÁC -> XÓA TRẮNG HOÀN TOÀN
    safeClearInput("tt32_mau1lamsangkhac");
    safeClearInput("tt32_mau1khac");
    const elKhacPl = document.getElementById("tt32_mau1lamsangkhacphanloai") || document.querySelector("select[id*='lamsangkhacphanloai']");
    if (elKhacPl) {
      elKhacPl.selectedIndex = 0;
      elKhacPl.value = "";
      elKhacPl.dispatchEvent(new Event("change", { bubbles: true }));
    }

    // Mắt
    safeSetInput("tt32_mau1khongkinhmatphai", mat.khong_kinh_mp || "");
    safeSetInput("tt32_mau1khongkinhmattrai", mat.khong_kinh_mt || "");
    safeSetInput("tt32_mau1cokinhmatphai", mat.co_kinh_mp || "");
    safeSetInput("tt32_mau1cokinhmattrai", mat.co_kinh_mt || "");
    safeSetInput("tt32_mau1benhvemat", mat.benh_ve_mat || "");
    const matPhanLoai = mat.phan_loai || (mat.benh_ve_mat || mat.co_kinh_mp ? "Loại II" : "Loại I");
    safeSelectOption("tt32_mau1matphanloai", matPhanLoai);

    // Tai Mũi Họng
    safeSetInput("tt32_mau1taitrainoithuong", tmh.tai_trai_noi_thuong || "");
    safeSetInput("tt32_mau1taitrainoitham", tmh.tai_trai_noi_tham || "");
    safeSetInput("tt32_mau1taiphainoithuong", tmh.tai_phai_noi_thuong || "");
    safeSetInput("tt32_mau1taiphainoitham", tmh.tai_phai_noi_tham || "");
    safeSetInput("tt32_mau1benhvetai", tmh.benh_tai_mui_hong || "Bình thường");
    safeSelectOption("tt32_mau1taimuihongphanloai", tmh.phan_loai || "Loại I");

    // Răng Hàm Mặt
    safeSetInput("tt32_mau1ranghamtren", rhm.ham_tren || "Bình thường");
    safeSetInput("tt32_mau1ranghamduoi", rhm.ham_duoi || "Bình thường");
    safeSetInput("tt32_mau1benhverang", rhm.benh_ve_rang || "Bình thường");
    safeSelectOption("tt32_mau1ranghammatphanloai", rhm.phan_loai || "Loại I");

    // TAB 4: CẬN LÂM SÀNG & KẾT LUẬN
    const tab4 = document.getElementById("tt32_mau1ksk_tab4");
    if (tab4) tab4.click();
    await sleep(200);

    // III: KHÁM CẬN LÂM SÀNG -> XÓA TRẮNG HOÀN TOÀN (CHÍNH XÁC ID tt32_mau1ketquacls2)
    safeClearInput("tt32_mau1ketquacls2");
    safeClearInput("tt32_mau1ketquacls");
    safeClearInput("tt32_mau1cls");
    safeClearInput("tt32_mau1canlamsang");
    const elClsDoc = document.getElementById("tt32_mau1bacsicls") || document.querySelector("select[id*='bacsicls']");
    if (elClsDoc) {
      elClsDoc.selectedIndex = 0;
      elClsDoc.value = "";
      elClsDoc.dispatchEvent(new Event("change", { bubbles: true }));
    }

    // IV: KẾT LUẬN
    safeSetInput("tt32_mau1suckhoabinhthuong", kl.tinh_trang_suc_khoe || "Cận thị");
    safeSelectOption("tt32_mau1phanloaiketluan", kl.phan_loai_suc_khoe || "Loại II");

    if (docVal) {
      const docCount = autofillDoctorToAllSpecialties(docVal);
      logAction(2, `Đã gán Bác sĩ (${docVal}) vào ${docCount} chuyên khoa (Bỏ qua lâm sàng khác & cận lâm sàng).`, "info");
    }

    await sleep(400);
    if (docVal) {
      autofillDoctorToAllSpecialties(docVal);
    }

    // Xóa trắng lại một lần nữa sau khi gán bác sĩ để đảm bảo 100% không bị ghi đè
    safeClearInput("tt32_mau1ketquacls2");
    safeClearInput("tt32_mau1lamsangkhac");

    logAction(2, "✅ Đã điền xong 4 Tab KSK TT25 & Gán Bác sĩ!", "success");
    updateStatus("success", "✅ Đã điền xong 4 Tab KSK TT25! Hãy kiểm tra và tự bấm nút [LƯU].");
  }

  // -------------------------------------------------------------
  // 6. BUILD IN-PAGE FLOATING WIDGET UI (GOOGLE AI STUDIO EXACT REPLICA)
  // -------------------------------------------------------------
  function createFloatingWidget() {
    if (document.getElementById("vnpt-rpa-floating-container")) return;

    const container = document.createElement("div");
    container.id = "vnpt-rpa-floating-container";
    container.innerHTML = `
      <!-- Collapsed Toggle Button -->
      <div id="vnpt-rpa-toggle" class="vnpt-rpa-toggle-btn" style="display: none;">
        <span class="pulse-container">
          <span class="pulse-ping"></span>
          <span class="pulse-dot"></span>
        </span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
        <span>Auto-Fill</span>
        <span class="vnpt-rpa-badge-ksk">KSK</span>
      </div>

      <!-- Main Floating Card -->
      <div id="vnpt-rpa-card" class="vnpt-rpa-card">
        <!-- Header -->
        <div class="vnpt-rpa-header">
          <div class="vnpt-rpa-header-left">
            <div class="vnpt-rpa-logo-box">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
            </div>
            <div style="display: flex; align-items: center; gap: 6px;">
              <span class="vnpt-rpa-header-title">VNPT HIS Auto-Fill</span>
              <span class="vnpt-rpa-badge-ksk">KSK</span>
            </div>
          </div>
          <div>
            <button id="vnpt-btn-minimize" class="vnpt-rpa-icon-btn" title="Thu gọn widget">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            </button>
          </div>
        </div>

        <!-- Navigation Tabs (4 Tabs) -->
        <div class="vnpt-rpa-tabs">
          <div id="vnpt-tab-nav-fill" class="vnpt-rpa-tab active">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><path d="M12 11h4"></path><path d="M12 16h4"></path><path d="M8 11h.01"></path><path d="M8 16h.01"></path></svg>
            <span>Nhập liệu</span>
          </div>
          <div id="vnpt-tab-nav-preview" class="vnpt-rpa-tab">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><polyline points="17 11 19 13 23 9"></polyline></svg>
            <span>Hồ sơ</span>
            <span id="vnpt-tab-dot" class="tab-dot" style="display: none;"></span>
          </div>
          <div id="vnpt-tab-nav-settings" class="vnpt-rpa-tab">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>
            <span>Cài đặt</span>
          </div>
          <div id="vnpt-tab-nav-logs" class="vnpt-rpa-tab tab-logs-btn" title="Nhật ký thao tác">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
          </div>
        </div>

        <!-- TAB 1: NHẬP LIỆU -->
        <div id="vnpt-tab-content-fill" class="vnpt-rpa-body">
          <div class="vnpt-rpa-form-group">
            <div class="vnpt-rpa-label-row">
              <label class="vnpt-rpa-label">Dán chuỗi JSON OCR bệnh nhân:</label>
              <button id="vnpt-btn-copy-prompt" class="vnpt-btn-sparkle" title="Copy Prompt Gemini OCR (đã ẩn danh)">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path></svg>
                <span>Format JSON</span>
              </button>
            </div>
            <textarea id="vnpt-json-input" class="vnpt-rpa-textarea" placeholder='{"thong_tin_chung": {"ho_ten": "NGUYỄN VĂN A", "cccd": "004210001234", ...}}'></textarea>
          </div>

          <!-- Patient Summary Badge (Ẩn danh hoàn toàn) -->
          <div id="vnpt-patient-badge" class="vnpt-patient-badge" style="display: none;">
            <div class="vnpt-patient-badge-top">
              <div class="vnpt-patient-user-info">
                <div id="vnpt-patient-gender-avatar" class="vnpt-patient-avatar">♂</div>
                <div>
                  <div id="vnpt-patient-name" class="vnpt-patient-name">NGUYỄN VĂN A</div>
                  <div id="vnpt-patient-sub" class="vnpt-patient-sub">Kinh • 15/05/2010</div>
                </div>
              </div>
              <span class="vnpt-patient-badge-valid">Hợp lệ</span>
            </div>

            <div class="vnpt-patient-grid">
              <div class="vnpt-patient-grid-item">
                <span class="label">CCCD:</span>
                <span id="vnpt-patient-cccd" class="val">004210001234</span>
              </div>
              <div class="vnpt-patient-grid-item">
                <span class="label">Xã/Phường:</span>
                <span id="vnpt-patient-phuong" class="val" style="max-width: 100px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">Phường Hợp Giang</span>
              </div>
            </div>
          </div>

          <!-- Empty Data Placeholder -->
          <div id="vnpt-empty-badge" style="padding: 12px; background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 12px; text-align: center; font-size: 11.5px; color: #64748b; margin-bottom: 14px;">
            Chưa có dữ liệu. Dán mã JSON để hệ thống tự phân tích.
          </div>

          <!-- Doctor Selection -->
          <div class="vnpt-rpa-form-group">
            <div class="vnpt-rpa-label-row">
              <label class="vnpt-rpa-label">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0284c7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"></path><path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"></path><circle cx="20" cy="10" r="2"></circle></svg>
                <span>Bác sĩ phụ trách (Khám TT25):</span>
              </label>
              <span style="font-size: 10.5px; color: #94a3b8;">Tự gán toàn bộ</span>
            </div>
            <select id="vnpt-doctor-select" class="vnpt-rpa-select">
              <option value="">-- Đang quét danh sách Bác sĩ --</option>
            </select>
          </div>

          <!-- Action Buttons (Grid 2 cols) -->
          <div class="vnpt-btn-grid">
            <button id="vnpt-btn-step1" class="vnpt-btn vnpt-btn-primary">
              <span>1️⃣ Tiếp nhận</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </button>
            <button id="vnpt-btn-step2" class="vnpt-btn vnpt-btn-success">
              <span>2️⃣ Khám TT25</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </button>
          </div>

          <!-- Status Message Box (Khớp 100% hình ảnh) -->
          <div id="vnpt-status-box" class="vnpt-rpa-status">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0;"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
            <span id="vnpt-status-text">Sẵn sàng tự động hóa VNPT HIS.</span>
          </div>
        </div>

        <!-- TAB 2: HỒ SƠ CHI TIẾT (PREVIEW) -->
        <div id="vnpt-tab-content-preview" class="vnpt-rpa-body" style="display: none;">
          <div id="vnpt-preview-content">
            <div style="text-align: center; padding: 24px; color: #94a3b8; font-size: 12px;">
              Chưa có dữ liệu để hiển thị. Vui lòng dán JSON ở Tab Nhập liệu.
            </div>
          </div>
        </div>

        <!-- TAB 3: CÀI ĐẶT (SETTINGS) -->
        <div id="vnpt-tab-content-settings" class="vnpt-rpa-body" style="display: none;">
          <div class="vnpt-rpa-form-group">
            <label class="vnpt-rpa-label">Phòng khám Tiếp nhận:</label>
            <select id="vnpt-set-phongkham" class="vnpt-rpa-select">
              <option value="3|PHÒNG KHÁM SỨC KHOẺ">3 - PHÒNG KHÁM SỨC KHOẺ</option>
              <option value="1|PHÒNG KHÁM">1 - PHÒNG KHÁM</option>
              <option value="2|PHÒNG KHÁM METHADONE">2 - PHÒNG KHÁM METHADONE</option>
            </select>
          </div>

          <div class="vnpt-rpa-form-group">
            <label class="vnpt-rpa-label">Dịch vụ khám:</label>
            <select id="vnpt-set-dichvu" class="vnpt-rpa-select">
              <option value="1223|Khám kiểm tra sức khỏe [dưới 18 tuổi]">1223 - Khám kiểm tra sức khỏe [dưới 18 tuổi]</option>
              <option value="1224|Khám kiểm tra sức khỏe [đủ 18 tuổi]">1224 - Khám kiểm tra sức khỏe [đủ 18 tuổi]</option>
              <option value="1220|Khám bệnh tại Trạm Y tế xã và đơn vị tương đương">1220 - Khám bệnh tại TYT xã</option>
              <option value="1221|Khám sức khoẻ cộng đồng">1221 - Khám sức khoẻ cộng đồng</option>
            </select>
          </div>

          <div class="vnpt-rpa-form-group">
            <label class="vnpt-rpa-label">Đối tượng KSK (Tab 1 TT25):</label>
            <select id="vnpt-set-doituong" class="vnpt-rpa-select">
              <option value="Học sinh trong các cơ sở giáo dục phổ thông">11 - Học sinh trong cơ sở giáo dục phổ thông</option>
              <option value="Trẻ em trong cơ sở giáo dục mầm non">10 - Trẻ em trong cơ sở mầm non</option>
              <option value="Sinh viên">12 - Sinh viên</option>
              <option value="Người lao động">13 - Người lao động</option>
              <option value="Người cao tuổi">1 - Người cao tuổi</option>
              <option value="Người khuyết tật">2 - Người khuyết tật</option>
              <option value="Người thuộc hộ nghèo, cận nghèo">3 - Hộ nghèo, cận nghèo</option>
              <option value="Các đối tượng khác">16 - Các đối tượng khác</option>
            </select>
          </div>

          <div class="vnpt-rpa-form-group">
            <label class="vnpt-rpa-label">Nguồn chi trả & Lý do khám:</label>
            <div style="display: flex; gap: 8px;">
              <select id="vnpt-set-nguon" class="vnpt-rpa-select" style="flex: 1;">
                <option value="Khác">Khác (mã 9)</option>
                <option value="Quỹ Bảo hiểm y tế">Quỹ BHYT (mã 3)</option>
                <option value="Ngân sách Địa phương">Ngân sách Địa phương (mã 2)</option>
                <option value="Ngân sách Trung ương">Ngân sách TW (mã 1)</option>
                <option value="Người sử dụng lao động">Người sử dụng LĐ (mã 4)</option>
                <option value="Xã hội hóa">Xã hội hóa (mã 5)</option>
              </select>
              <select id="vnpt-set-lydo" class="vnpt-rpa-select" style="flex: 1;">
                <option value="khám sức khỏe định kì">khám sức khỏe định kì</option>
                <option value="khám sức khỏe học sinh">khám sức khỏe học sinh</option>
                <option value="khám sức khỏe đầu vào">khám sức khỏe đầu vào</option>
                <option value="khám sức khỏe phân loại">khám sức khỏe phân loại</option>
              </select>
            </div>
          </div>

          <div class="vnpt-rpa-form-group">
            <label class="vnpt-rpa-label">Bác sĩ ưu tiên mặc định:</label>
            <select id="vnpt-set-bs" class="vnpt-rpa-select">
              <option value="Nông Thị Luyến">BS. Nông Thị Luyến</option>
            </select>
          </div>

          <button id="vnpt-btn-save-settings" class="vnpt-btn vnpt-btn-primary" style="width: 100%; margin-top: 8px;">
            <span>💾 Lưu Cài Đặt (Lưu vào Chrome Storage)</span>
          </button>
        </div>

        <!-- TAB 4: NHẬT KÝ (LOGS) -->
        <div id="vnpt-tab-content-logs" class="vnpt-rpa-body" style="display: none;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; font-size: 11.5px; color: #64748b;">
            <span>Lịch sử các bước thực thi:</span>
            <span id="vnpt-log-count-text">0 bản ghi</span>
          </div>
          <div id="vnpt-logs-list">
            <div style="text-align: center; padding: 20px; color: #94a3b8; font-size: 11.5px;">
              Chưa có thao tác nào được ghi nhận.
            </div>
          </div>
        </div>

        <!-- Footer (Khớp 100% hình ảnh) -->
        <div class="vnpt-rpa-footer">
          <div class="live-badge">
            <span class="live-dot"></span>
            <span>Sẵn sàng kết nối VNPT HIS</span>
          </div>
          <span style="font-family: ui-monospace, SFMono-Regular, monospace; font-size: 10px; color: #94a3b8;">TYT & PK</span>
        </div>
      </div>
    `;

    document.body.appendChild(container);
    setupWidgetEvents();
  }

  // -------------------------------------------------------------
  // 7. WIDGET EVENTS & INTERACTIONS
  // -------------------------------------------------------------
  let parsedData = null;

  function updateLogsView() {
    const list = document.getElementById("vnpt-logs-list");
    const countText = document.getElementById("vnpt-log-count-text");

    if (countText) countText.textContent = `${executionLogs.length} bản ghi`;
    if (!list) return;

    if (executionLogs.length === 0) {
      list.innerHTML = `<div style="text-align: center; padding: 20px; color: #94a3b8; font-size: 11.5px;">Chưa có thao tác nào được ghi nhận.</div>`;
      return;
    }

    list.innerHTML = executionLogs.map((l) => `
      <div class="vnpt-log-item ${l.type}">
        <div style="display: flex; justify-content: space-between; margin-bottom: 2px; font-size: 10px; opacity: 0.8;">
          <span>${l.timestamp}</span>
          ${l.step ? `<span>Bước ${l.step}</span>` : ""}
        </div>
        <div>${l.message}</div>
      </div>
    `).join("");
  }

  function updatePreviewTab() {
    const previewBox = document.getElementById("vnpt-preview-content");
    const tabDot = document.getElementById("vnpt-tab-dot");
    if (!previewBox) return;

    if (!parsedData) {
      if (tabDot) tabDot.style.display = "none";
      previewBox.innerHTML = `
        <div style="text-align: center; padding: 24px; color: #94a3b8; font-size: 12px;">
          Chưa có dữ liệu để hiển thị. Vui lòng dán JSON ở Tab Nhập liệu.
        </div>`;
      return;
    }

    if (tabDot) tabDot.style.display = "inline-block";

    const tt = parsedData.thong_tin_chung || {};
    const dc = parsedData.dia_chi || {};
    const lh = parsedData.nguoi_lien_he || {};
    const sh = parsedData.sinh_hieu || {};
    const kl = parsedData.ket_luan || {};
    const mat = parsedData.mat || {};
    const tmh = parsedData.tai_mui_hong || {};
    const rhm = parsedData.rang_ham_mat || {};

    previewBox.innerHTML = `
      <div class="vnpt-preview-card">
        <div class="vnpt-preview-title" style="color: #0369a1;">
          <span>👤</span> <span>1. Hành chính & Liên hệ</span>
        </div>
        <div class="vnpt-preview-grid">
          <div><span style="color: #64748b;">Họ tên:</span> <strong>${tt.ho_ten || "—"}</strong></div>
          <div><span style="color: #64748b;">CCCD:</span> <strong>${tt.cccd || "—"}</strong></div>
          <div><span style="color: #64748b;">Ngày sinh:</span> ${tt.ngay_sinh || "—"}</div>
          <div><span style="color: #64748b;">Giới tính:</span> ${tt.gioi_tinh || "—"} (${tt.dan_toc || "Kinh"})</div>
          <div style="grid-column: span 2;"><span style="color: #64748b;">Địa chỉ:</span> ${dc.day_du || "—"}</div>
          <div style="grid-column: span 2;"><span style="color: #64748b;">Phụ huynh:</span> ${lh.ho_ten_me || lh.ho_ten_cha || lh.nguoi_giam_ho || "—"}</div>
        </div>
      </div>

      <div class="vnpt-preview-card">
        <div class="vnpt-preview-title" style="color: #059669;">
          <span>📊</span> <span>2. Sinh hiệu & Thể lực (Tab 2)</span>
        </div>
        <div class="vnpt-preview-vitals">
          <div class="vnpt-vital-box">
            <div class="label">Chiều cao</div>
            <div class="val">${sh.chieu_cao || "—"} cm</div>
          </div>
          <div class="vnpt-vital-box">
            <div class="label">Cân nặng</div>
            <div class="val">${sh.can_nang || "—"} kg</div>
          </div>
          <div class="vnpt-vital-box">
            <div class="label">BMI</div>
            <div class="val">${sh.bmi || "—"}</div>
          </div>
          <div class="vnpt-vital-box" style="grid-column: span 2;">
            <div class="label">Huyết áp / Mạch</div>
            <div class="val">${sh.huyet_ap || "—"} mmHg • ${sh.mach || "—"} l/p</div>
          </div>
          <div class="vnpt-vital-box">
            <div class="label">Xếp loại</div>
            <div class="val" style="color: #059669;">${sh.phan_loai || "Loại I"}</div>
          </div>
        </div>
      </div>

      <div class="vnpt-preview-card">
        <div class="vnpt-preview-title" style="color: #7c3aed;">
          <span>👁️</span> <span>3. Chuyên khoa & Kết luận (Tab 3 & 4)</span>
        </div>
        <div style="font-size: 11.5px; line-height: 1.6;">
          <div><span style="color: #64748b;">Mắt:</span> Có kính MP ${mat.co_kinh_mp || "—"}, MT ${mat.co_kinh_mt || "—"} ${mat.benh_ve_mat ? `(${mat.benh_ve_mat})` : ""} -> <strong>${mat.phan_loai || "Loại I"}</strong></div>
          <div><span style="color: #64748b;">Tai Mũi Họng:</span> ${tmh.benh_tai_mui_hong || "Bình thường"} -> <strong>${tmh.phan_loai || "Loại I"}</strong></div>
          <div><span style="color: #64748b;">Răng Hàm Mặt:</span> ${rhm.benh_ve_rang || "Bình thường"} -> <strong>${rhm.phan_loai || "Loại I"}</strong></div>
          <div style="padding-top: 4px; margin-top: 4px; border-top: 1px solid #e2e8f0;">
            <span style="color: #64748b;">Kết luận chung:</span> <strong style="color: #0369a1;">${kl.tinh_trang_suc_khoe || "Cận thị"} (${kl.phan_loai_suc_khoe || "Loại II"})</strong>
          </div>
        </div>
      </div>
    `;
  }

  function setupWidgetEvents() {
    const card = document.getElementById("vnpt-rpa-card");
    const toggleBtn = document.getElementById("vnpt-rpa-toggle");
    const btnMinimize = document.getElementById("vnpt-btn-minimize");

    const tabNavFill = document.getElementById("vnpt-tab-nav-fill");
    const tabNavPreview = document.getElementById("vnpt-tab-nav-preview");
    const tabNavSettings = document.getElementById("vnpt-tab-nav-settings");
    const tabNavLogs = document.getElementById("vnpt-tab-nav-logs");

    const tabContentFill = document.getElementById("vnpt-tab-content-fill");
    const tabContentPreview = document.getElementById("vnpt-tab-content-preview");
    const tabContentSettings = document.getElementById("vnpt-tab-content-settings");
    const tabContentLogs = document.getElementById("vnpt-tab-content-logs");

    const jsonInput = document.getElementById("vnpt-json-input");
    const btnCopyPrompt = document.getElementById("vnpt-btn-copy-prompt");

    const patientBadge = document.getElementById("vnpt-patient-badge");
    const emptyBadge = document.getElementById("vnpt-empty-badge");
    const patientGenderAvatar = document.getElementById("vnpt-patient-gender-avatar");
    const patientName = document.getElementById("vnpt-patient-name");
    const patientSub = document.getElementById("vnpt-patient-sub");
    const patientCccd = document.getElementById("vnpt-patient-cccd");
    const patientPhuong = document.getElementById("vnpt-patient-phuong");

    const doctorSelect = document.getElementById("vnpt-doctor-select");
    const btnStep1 = document.getElementById("vnpt-btn-step1");
    const btnStep2 = document.getElementById("vnpt-btn-step2");
    const statusBox = document.getElementById("vnpt-status-box");
    const statusText = document.getElementById("vnpt-status-text");

    const btnSaveSettings = document.getElementById("vnpt-btn-save-settings");

    const setPhongkham = document.getElementById("vnpt-set-phongkham");
    const setDichvu = document.getElementById("vnpt-set-dichvu");
    const setDoituong = document.getElementById("vnpt-set-doituong");
    const setNguon = document.getElementById("vnpt-set-nguon");
    const setLydo = document.getElementById("vnpt-set-lydo");
    const setBs = document.getElementById("vnpt-set-bs");

    let userChosenDoctorValue = null;

    doctorSelect.addEventListener("change", () => {
      userChosenDoctorValue = doctorSelect.value;
      logAction(null, "Người dùng chọn Bác sĩ: " + (doctorSelect.options[doctorSelect.selectedIndex]?.text || ""), "info");
    });

    function updateStatus(type, msg) {
      statusBox.className = `vnpt-rpa-status ${type}`;
      statusText.textContent = msg;
    }

    // Switch Tabs
    function activateTab(nav, content) {
      [tabNavFill, tabNavPreview, tabNavSettings, tabNavLogs].forEach((t) => t.classList.remove("active"));
      [tabContentFill, tabContentPreview, tabContentSettings, tabContentLogs].forEach((c) => (c.style.display = "none"));
      nav.classList.add("active");
      content.style.display = "block";
    }

    tabNavFill.addEventListener("click", () => activateTab(tabNavFill, tabContentFill));
    tabNavPreview.addEventListener("click", () => {
      activateTab(tabNavPreview, tabContentPreview);
      updatePreviewTab();
    });
    tabNavSettings.addEventListener("click", () => {
      activateTab(tabNavSettings, tabContentSettings);
      populateSettingsForm();
    });
    tabNavLogs.addEventListener("click", () => {
      activateTab(tabNavLogs, tabContentLogs);
      updateLogsView();
    });

    btnMinimize.addEventListener("click", () => {
      card.style.display = "none";
      toggleBtn.style.display = "inline-flex";
    });

    toggleBtn.addEventListener("click", () => {
      toggleBtn.style.display = "none";
      card.style.display = "flex";
      refreshDoctorsDropdown();
    });

    // Copy Prompt / Format JSON
    btnCopyPrompt.addEventListener("click", async () => {
      const raw = jsonInput.value.trim();
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          jsonInput.value = JSON.stringify(parsed, null, 2);
        } catch (e) {}
      }

      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(ANONYMIZED_GEMINI_PROMPT);
        } else {
          const tempArea = document.createElement("textarea");
          tempArea.value = ANONYMIZED_GEMINI_PROMPT;
          document.body.appendChild(tempArea);
          tempArea.select();
          document.execCommand("copy");
          document.body.removeChild(tempArea);
        }
        updateStatus("info", "✨ Đã copy Prompt Gemini OCR vào Clipboard! Hãy dán vào Google AI Studio.");
        logAction(null, "Đã copy Prompt Gemini OCR vào Clipboard.", "info");
      } catch (err) {
        updateStatus("error", `Không thể copy: ${err.message}`);
      }
    });

    // JSON Parse
    jsonInput.addEventListener("input", () => {
      const raw = jsonInput.value.trim();
      if (!raw) {
        patientBadge.style.display = "none";
        emptyBadge.style.display = "block";
        parsedData = null;
        updatePreviewTab();
        updateStatus("info", "Sẵn sàng tự động hóa VNPT HIS.");
        return;
      }
      try {
        parsedData = JSON.parse(raw);
        const tt = parsedData.thong_tin_chung || {};
        const dc = parsedData.dia_chi || {};

        patientName.textContent = tt.ho_ten || "BỆNH NHÂN";
        patientGenderAvatar.textContent = tt.gioi_tinh === "Nam" ? "♂" : "♀";
        patientSub.textContent = `${tt.dan_toc || "Kinh"} • ${tt.ngay_sinh || "—"}`;
        patientCccd.textContent = tt.cccd || "—";
        patientPhuong.textContent = dc.phuong_xa || "Tự nhận diện";

        patientBadge.style.display = "block";
        emptyBadge.style.display = "none";
        updatePreviewTab();
        updateStatus("info", `Đã nhận diện hồ sơ: ${tt.ho_ten || ""}`);
        logAction(null, `Đã phân tích JSON hồ sơ: ${tt.ho_ten || ""}`, "info");
      } catch (e) {
        patientBadge.style.display = "none";
        emptyBadge.style.display = "block";
        parsedData = null;
        updatePreviewTab();
      }
    });

    function refreshDoctorsDropdown() {
      const doctors = extractDoctorsFromPage();
      if (doctors.length > 0) {
        const savedVal = userChosenDoctorValue || doctorSelect.value;
        doctorSelect.innerHTML = "";
        
        let matchedIdx = -1;
        let defaultPrefIdx = 0;

        doctors.forEach((doc, idx) => {
          const opt = document.createElement("option");
          opt.value = doc.value;
          const isPref = currentSettings.bac_si_mac_dinh && doc.name.includes(currentSettings.bac_si_mac_dinh);
          if (isPref) defaultPrefIdx = idx;
          if (savedVal && String(doc.value) === String(savedVal)) matchedIdx = idx;
          opt.textContent = `${doc.name} ${isPref ? "⭐ (Ưu tiên)" : ""} — Khám sức khỏe tổng quát`;
          doctorSelect.appendChild(opt);
        });

        if (matchedIdx !== -1) {
          doctorSelect.selectedIndex = matchedIdx;
        } else {
          doctorSelect.selectedIndex = defaultPrefIdx;
        }
      } else {
        doctorSelect.innerHTML = `<option value="1042">BS. Nông Thị Luyến ⭐ (Ưu tiên) — Khám sức khỏe tổng quát</option>`;
      }
    }

    btnStep1.addEventListener("click", async () => {
      if (!parsedData) {
        updateStatus("error", "❌ Vui lòng dán chuỗi JSON OCR hợp lệ vào ô phía trên!");
        return;
      }
      btnStep1.disabled = true;
      try {
        await runStep1TiepNhan(parsedData, currentSettings, updateStatus);
      } catch (err) {
        updateStatus("error", `Lỗi: ${err.message}`);
        logAction(1, `Lỗi: ${err.message}`, "error");
      } finally {
        btnStep1.disabled = false;
      }
    });

    btnStep2.addEventListener("click", async () => {
      if (!parsedData) {
        updateStatus("error", "❌ Vui lòng dán chuỗi JSON OCR hợp lệ vào ô phía trên!");
        return;
      }
      
      const chosenDoctorVal = userChosenDoctorValue || doctorSelect.value;
      btnStep2.disabled = true;
      try {
        await runStep2KhamBenh(parsedData, currentSettings, chosenDoctorVal, updateStatus);
      } catch (err) {
        updateStatus("error", `Lỗi: ${err.message}`);
        logAction(2, `Lỗi: ${err.message}`, "error");
      } finally {
        btnStep2.disabled = false;
      }
    });

    function populateSettingsForm() {
      const clinics = extractClinicsFromPage();
      setPhongkham.innerHTML = "";
      clinics.forEach((pk) => {
        const opt = document.createElement("option");
        opt.value = `${pk.id}|${pk.name}`;
        opt.textContent = pk.name;
        if (currentSettings.phong_kham_id === pk.id || (currentSettings.phong_kham_name && pk.name.includes(currentSettings.phong_kham_name))) {
          opt.selected = true;
        }
        setPhongkham.appendChild(opt);
      });

      const services = extractServicesFromPage();
      setDichvu.innerHTML = "";
      services.forEach((dv) => {
        const opt = document.createElement("option");
        opt.value = `${dv.id}|${dv.name}`;
        opt.textContent = dv.name;
        if (currentSettings.dich_vu_id === dv.id || (currentSettings.dich_vu_name && dv.name.includes(currentSettings.dich_vu_name))) {
          opt.selected = true;
        }
        setDichvu.appendChild(opt);
      });

      const doituongs = extractDoiTuongFromPage();
      setDoituong.innerHTML = "";
      doituongs.forEach((dt) => {
        const opt = document.createElement("option");
        opt.value = dt.name;
        opt.textContent = dt.name;
        if (currentSettings.doi_tuong_tt25 && dt.name.includes(currentSettings.doi_tuong_tt25)) {
          opt.selected = true;
        }
        setDoituong.appendChild(opt);
      });

      const nguons = extractNguonChiTraFromPage();
      setNguon.innerHTML = "";
      nguons.forEach((ng) => {
        const opt = document.createElement("option");
        opt.value = ng.name;
        opt.textContent = ng.name;
        if (currentSettings.nguon_chi_tra_tt25 && ng.name.includes(currentSettings.nguon_chi_tra_tt25)) {
          opt.selected = true;
        }
        setNguon.appendChild(opt);
      });

      for (let i = 0; i < setLydo.options.length; i++) {
        if (setLydo.options[i].value === currentSettings.ly_do_kham_tt25) {
          setLydo.selectedIndex = i;
          break;
        }
      }

      const doctors = extractDoctorsFromPage();
      setBs.innerHTML = "";
      if (doctors.length > 0) {
        doctors.forEach((doc) => {
          const opt = document.createElement("option");
          opt.value = doc.name;
          opt.textContent = doc.name;
          if (currentSettings.bac_si_mac_dinh && doc.name.includes(currentSettings.bac_si_mac_dinh)) {
            opt.selected = true;
          }
          setBs.appendChild(opt);
        });
      } else {
        const opt = document.createElement("option");
        opt.value = currentSettings.bac_si_mac_dinh || "Nông Thị Luyến";
        opt.textContent = currentSettings.bac_si_mac_dinh || "BS. Nông Thị Luyến";
        setBs.appendChild(opt);
      }
    }

    btnSaveSettings.addEventListener("click", () => {
      const pkParts = setPhongkham.value.split("|");
      const dvParts = setDichvu.value.split("|");

      const updated = {
        phong_kham_id: pkParts[0] || "3",
        phong_kham_name: pkParts[1] || "PHÒNG KHÁM SỨC KHOẺ",
        dich_vu_id: dvParts[0] || "1223",
        dich_vu_name: dvParts[1] || "Khám kiểm tra sức khỏe [dưới 18 tuổi]",
        doi_tuong_tt25: setDoituong.value,
        nguon_chi_tra_tt25: setNguon.value,
        ly_do_kham_tt25: setLydo.value,
        bac_si_mac_dinh: setBs.value
      };

      saveSettings(updated, () => {
        logAction(null, "Đã lưu cài đặt mới vào bộ nhớ.", "info");
        alert("✅ Đã lưu Cài đặt thành công!");
        tabNavFill.click();
      });
    });

    refreshDoctorsDropdown();

    setInterval(() => {
      if (document.getElementById("tt32_mau1ksk_tab1") || document.getElementById("khamsuckhoetheodoituong")) {
        if (doctorSelect.options.length <= 1) {
          refreshDoctorsDropdown();
        }
      }
    }, 2000);
  }

  // -------------------------------------------------------------
  // 8. INITIALIZATION
  // -------------------------------------------------------------
  loadSettings(() => {
    createFloatingWidget();
    logAction(null, "Extension VNPT HIS Auto-Fill KSK đã sẵn sàng.", "info");
  });
})();
