---
title: PDFKit and wkhtmltopdf without X Server, using qt
description: "If your PDFKit and wkhtmltopdf is working on your development server, probably in OSX, but not working on your production server, which is probably running linux, it's because you're missing X Server."
slug: "pdfkit-and-wkhtmltopdf-without-x-server-using-qt"
comments: true
date: "2010-07-15"
template: "post"
draft: false
category: "Tutorial"
legacyArticleId: "26"
tags:
  - "Code"
  - "Ruby on Rails"
---

If your PDFKit and wkhtmltopdf is working on your development server, probably in OSX, but not working on your production server, which is probably running linux, it's because you're missing X Server.

There are a few ways around this, some emulate X Server, but that seems hacky. I read through the wkhtmltopdf docs and read that a patched qt framework will allow you to use wkhtmltopdf without using X Server.

Here's what I did on my Ubuntu Box to get this to work (note: the compile time for qt was almost 2 hours, and you'll also need to have git installed):

```text
sudo apt-get build-dep libqt4-gui libqt4-network libqt4-webkit
sudo apt-get install openssl build-essential xorg git-core git-doc libssl-dev

mkdir ~/sources
cd ~/sources
git clone git://gitorious.org/+wkhtml2pdf/qt/wkhtmltopdf-qt.git wkhtmltopdf-qt
cd wkhtmltopdf-qt
./configure -nomake tools,examples,demos,docs,translations -opensource -prefix ../wkqt
make -j3
make install
cd ..
```

Next install wkhtmltopdf:

```text
git clone git://github.com/antialize/wkhtmltopdf.git wkhtmltopdf
cd wkhtmltopdf
../wkqt/bin/qmake
make -j3
make install
```

Run 'wkhtmltopdf' in shell and you should see it load correctly instead of seeing the x server error. Running 'wkhtmltopdf-proxy' should do the same, which is what PDFKit uses.