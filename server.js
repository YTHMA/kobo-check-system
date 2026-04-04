const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

// تفعيل CORS عشان يسمح لصفحة الجيتهاب تفتح السيرفر
app.use(cors());
app.use(express.json());

// بيانات الربط الخاصة بك
const KOBO_TOKEN = '68dc68001721d6158683216676168936ea534707';
const ASSET_UID = 'a8wEcodN5m7xFr7NaHxte9';

app.get('/check/:value', async (req, res) => {
    const searchValue = req.params.value.trim();
    console.log(`🔍 جاري البحث السريع عن: [${searchValue}]`);

    const query = {
        "$or": [
            { "n_id": searchValue },
            { "fam_rep/n_id2": searchValue }
        ]
    };

    try {
        const response = await axios.get(`https://kf.kobotoolbox.org/api/v2/assets/${ASSET_UID}/data/`, {
            params: { query: JSON.stringify(query) },
            headers: { 'Authorization': `Token ${KOBO_TOKEN}` }
        });

        if (response.data.results && response.data.results.length > 0) {
            const user = response.data.results[0];
            let fullName = "";

            if (String(user.n_id) === searchValue) {
                fullName = `${user.f_name || ''} ${user.m_name || ''} ${user.g_name || ''} ${user.l_name || ''}`;
            } else if (user.fam_rep && Array.isArray(user.fam_rep)) {
                const member = user.fam_rep.find(m => String(m['fam_rep/n_id2']) === searchValue);
                if (member) {
                    fullName = `${member['fam_rep/f_name2'] || ''} ${member['fam_rep/m_name2'] || ''} ${member['fam_rep/g_name2'] || ''} ${member['fam_rep/l_name2'] || ''}`;
                }
            }

            const finalName = fullName.replace(/\s+/g, ' ').trim() || "تم التحقق";
            console.log(`✅ تم العثور: ${finalName}`);
            res.json({ status: 'found', fullName: finalName });
        } else {
            console.log(`❌ لم يتم العثور على الرقم.`);
            res.json({ status: 'not_found' });
        }
    } catch (error) {
        console.error("Kobo API Error:", error.response ? error.response.data : error.message);
        res.status(500).json({ status: 'error', message: 'فشل الاتصال بقاعدة البيانات' });
    }
});

// إضافة صفحة رئيسية بسيطة عشان رسالة "القطر" تختفي وتعرف إن السيرفر شغال
app.get('/', (req, res) => {
    res.send('🚀 السيرفر يعمل بنجاح وجاهز لاستقبال الطلبات!');
});

// --- التعديل الجوهري للرفع أونلاين ---
const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ السيرفر يعمل الآن على بورت: ${PORT}`);
    console.log(`🔗 جرب الرابط أونلاين الآن!`);
});