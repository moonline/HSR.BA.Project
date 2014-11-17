#!/bin/bash

echo "== Starting up ADRepo =="
sudo /home/vagrant/ADRepo/adrepo-0.1.2-SNAPSHOT/bin/adrepo -Dhttp.port=9940 &
echo "== Waiting for ADRepo to have started =="
until $(curl --output /dev/null --silent --head --fail http://localhost:9940/element); do
	printf '.'
	sleep 1
done

echo "== Providing additional example data =="
# HOW TO GENERATE THIS EXAMPLE DATA
# 1. Capture traffic with Wireshark
# 2. Follow TCP Stream (?.?.?.?:38??? -> 152.96.?.?:9940)
# 3. Copy to TextWrangler (or any other advanced text editor)
# 4. Replace all	\n	by \\n
# 5. Replace all	"	by	\\"
# 6. Replace all	POST\s(\/[^\s]+).*?Host:\s([^\s\\]+).*?\\n\\n({.*?}(?!,))	by	curl -sS -H "Content-Type: application/json;charset=UTF-8" --data-binary "\3" localhost:9940\1\n
# 7. Replace all	PUT\s(\/[^\s]+).*?Host:\s([^\s\\]+).*?\\n\\n	by	curl -sS --request PUT localhost:9940\1\n
# 8. Replace all	\\n	by	(nothing)
curl -sS -H "Content-Type: application/json;charset=UTF-8" --data-binary "{  \"kind\": \"ProblemTemplate\",  \"path\": [    \"ZIO-WorkflowGuidanceModel\",    \"Class Componentization and Integration View\",    \"SOA Design Decisions\",    \"Logical Layering\"  ],  \"attributes\": {    \"Owner Role\": \"Any\",    \"Intellectual Property Rights\": \"Unrestricted\",    \"Project Stage\": \"\",    \"XModelId\": \"ADMentor:0.2.0\",    \"Stakeholder Roles\": \"Any\",    \"Organisational Reach\": \"Project\",    \"Viewpoint\": \"\"  },  \"notes\": \"PoEAA, SOA book, own?\"}" localhost:9940/element
curl -sS -H "Content-Type: application/json;charset=UTF-8" --data-binary "{  \"kind\": \"ProblemTemplate\",  \"path\": [    \"ZIO-WorkflowGuidanceModel\",    \"Class Componentization and Integration View\",    \"SOA Design Decisions\",    \"Service Scope Granularity\"  ],  \"attributes\": {    \"Owner Role\": \"Any\",    \"Intellectual Property Rights\": \"Unrestricted\",    \"Project Stage\": \"\",    \"XModelId\": \"ADMentor:0.2.0\",    \"Stakeholder Roles\": \"Any\",    \"Organisational Reach\": \"Project\",    \"Viewpoint\": \"\"  },  \"notes\": \"\"}" localhost:9940/element
curl -sS -H "Content-Type: application/json;charset=UTF-8" --data-binary "{  \"kind\": \"OptionTemplate\",  \"path\": [    \"ZIO-WorkflowGuidanceModel\",    \"Class Componentization and Integration View\",    \"SOA Design Decisions\",    \"Coarse\"  ],  \"attributes\": {    \"Intellectual Property Rights\": \"Unrestricted\",    \"XModelId\": \"ADMentor:0.2.0\"  },  \"notes\": \"\"}" localhost:9940/element
curl -sS -H "Content-Type: application/json;charset=UTF-8" --data-binary "{  \"kind\": \"OptionTemplate\",  \"path\": [    \"ZIO-WorkflowGuidanceModel\",    \"Class Componentization and Integration View\",    \"SOA Design Decisions\",    \"Fine\"  ],  \"attributes\": {    \"Intellectual Property Rights\": \"Unrestricted\",    \"XModelId\": \"ADMentor:0.2.0\"  },  \"notes\": \"\"}" localhost:9940/element
curl -sS -H "Content-Type: application/json;charset=UTF-8" --data-binary "{  \"kind\": \"OptionTemplate\",  \"path\": [    \"ZIO-WorkflowGuidanceModel\",    \"Class Componentization and Integration View\",    \"SOA Design Decisions\",    \"Dot Pattern\"  ],  \"attributes\": {    \"Intellectual Property Rights\": \"Unrestricted\",    \"XModelId\": \"ADMentor:0.2.0\"  },  \"notes\": \"<b><i>Dot Pattern</i></b>\r<b>Single scalar parameter</b>\r\rEasy to process for SOAP/XML engines, much work for programmer\"}" localhost:9940/element
curl -sS -H "Content-Type: application/json;charset=UTF-8" --data-binary "{  \"kind\": \"OptionTemplate\",  \"path\": [    \"ZIO-WorkflowGuidanceModel\",    \"Class Componentization and Integration View\",    \"SOA Design Decisions\",    \"Dotted Line Pattern\"  ],  \"attributes\": {    \"Intellectual Property Rights\": \"Unrestricted\",    \"XModelId\": \"ADMentor:0.2.0\"  },  \"notes\": \"<b><i>Dotted Line Pattern</i></b>\r<b>Multiple scalar parameters</b>\r\rHandled by all common engines, some programmer convenience.\"}" localhost:9940/element
curl -sS -H "Content-Type: application/json;charset=UTF-8" --data-binary "{  \"kind\": \"OptionTemplate\",  \"path\": [    \"ZIO-WorkflowGuidanceModel\",    \"Class Componentization and Integration View\",    \"SOA Design Decisions\",    \"Bar Pattern\"  ],  \"attributes\": {    \"Intellectual Property Rights\": \"Unrestricted\",    \"XModelId\": \"ADMentor:0.2.0\"  },  \"notes\": \"<b><i>Bar</i></b><b> Pattern</b>\r<b>Single complex parameter</b>\r\rDeep structure and exotic types can cause interoperability issues.\"}" localhost:9940/element
curl -sS -H "Content-Type: application/json;charset=UTF-8" --data-binary "{  \"kind\": \"OptionTemplate\",  \"path\": [    \"ZIO-WorkflowGuidanceModel\",    \"Class Componentization and Integration View\",    \"SOA Design Decisions\",    \"Comb Pattern\"  ],  \"attributes\": {    \"Intellectual Property Rights\": \". HSR FHO\",    \"XModelId\": \"ADMentor:0.2.0\"  },  \"notes\": \"<b><i>Comb Pattern</i></b>\r<b>Multiple complex parameters</b>\r\rCombination of options 2 and 3, biggest overhead for processing engines.\"}" localhost:9940/element
curl -sS -H "Content-Type: application/json;charset=UTF-8" --data-binary "{  \"kind\": \"ProblemTemplate\",  \"path\": [    \"ZIO-WorkflowGuidanceModel\",    \"Class Componentization and Integration View\",    \"SOA Design Decisions\",    \"Contract Language\"  ],  \"attributes\": {    \"Owner Role\": \"Any\",    \"Intellectual Property Rights\": \"Unrestricted\",    \"Project Stage\": \"\",    \"XModelId\": \"ADMentor:0.2.0\",    \"Stakeholder Roles\": \"Any\",    \"Organisational Reach\": \"Project\",    \"Viewpoint\": \"\"  },  \"notes\": \"\"}" localhost:9940/element
curl -sS -H "Content-Type: application/json;charset=UTF-8" --data-binary "{  \"kind\": \"ProblemTemplate\",  \"path\": [    \"ZIO-WorkflowGuidanceModel\",    \"Class Componentization and Integration View\",    \"SOA Design Decisions\",    \"Integration Protocol\"  ],  \"attributes\": {    \"Owner Role\": \"Any\",    \"Intellectual Property Rights\": \"Unrestricted\",    \"Project Stage\": \"\",    \"XModelId\": \"ADMentor:0.2.0\",    \"Stakeholder Roles\": \"Any\",    \"Organisational Reach\": \"Project\",    \"Viewpoint\": \"\"  },  \"notes\": \"\"}" localhost:9940/element
curl -sS -H "Content-Type: application/json;charset=UTF-8" --data-binary "{  \"kind\": \"ProblemTemplate\",  \"path\": [    \"ZIO-WorkflowGuidanceModel\",    \"Class Componentization and Integration View\",    \"SOA Design Decisions\",    \"Message Exchange Pattern\"  ],  \"attributes\": {    \"Owner Role\": \"Any\",    \"Intellectual Property Rights\": \"Unrestricted\",    \"Project Stage\": \"\",    \"XModelId\": \"ADMentor:0.2.0\",    \"Stakeholder Roles\": \"Any\",    \"Organisational Reach\": \"Project\",    \"Viewpoint\": \"\"  },  \"notes\": \"\"}" localhost:9940/element
curl -sS -H "Content-Type: application/json;charset=UTF-8" --data-binary "{  \"kind\": \"ProblemTemplate\",  \"path\": [    \"ZIO-WorkflowGuidanceModel\",    \"Class Componentization and Integration View\",    \"SOA Design Decisions\",    \"Policy Assertion Language\"  ],  \"attributes\": {    \"Owner Role\": \"Any\",    \"Intellectual Property Rights\": \"Unrestricted\",    \"Project Stage\": \"\",    \"XModelId\": \"ADMentor:0.2.0\",    \"Stakeholder Roles\": \"Any\",    \"Organisational Reach\": \"Project\",    \"Viewpoint\": \"\"  },  \"notes\": \"\"}" localhost:9940/element
curl -sS -H "Content-Type: application/json;charset=UTF-8" --data-binary "{  \"kind\": \"OptionOccurrence\",  \"path\": [    \"ZIO-WorkflowGuidanceModel\",    \"Class Componentization and Integration View\",    \"SOA Design Decisions\",    \"Coarse\"  ],  \"attributes\": {    \"XModelId\": \"ADMentor:2\"  },  \"notes\": \"ZIO\",  \"state\": \"Neglected\"}" localhost:9940/element
curl -sS -H "Content-Type: application/json;charset=UTF-8" --data-binary "{  \"kind\": \"OptionOccurrence\",  \"path\": [    \"ZIO-WorkflowGuidanceModel\",    \"Class Componentization and Integration View\",    \"SOA Design Decisions\",    \"Coarse\"  ],  \"attributes\": {    \"XModelId\": \"ADMentor:2\"  },  \"notes\": \"\",  \"state\": \"Eligible\"}" localhost:9940/element
curl -sS -H "Content-Type: application/json;charset=UTF-8" --data-binary "{  \"kind\": \"OptionOccurrence\",  \"path\": [    \"ZIO-WorkflowGuidanceModel\",    \"Class Componentization and Integration View\",    \"SOA Design Decisions\",    \"Fine\"  ],  \"attributes\": {    \"XModelId\": \"ADMentor:2\"  },  \"notes\": \"\",  \"state\": \"Eligible\"}" localhost:9940/element
curl -sS -H "Content-Type: application/json;charset=UTF-8" --data-binary "{  \"kind\": \"OptionOccurrence\",  \"path\": [    \"ZIO-WorkflowGuidanceModel\",    \"Class Componentization and Integration View\",    \"SOA Design Decisions\",    \"Fine\"  ],  \"attributes\": {    \"XModelId\": \"ADMentor:2\"  },  \"notes\": \"\",  \"state\": \"Chosen\"}" localhost:9940/element
curl -sS -H "Content-Type: application/json;charset=UTF-8" --data-binary "{  \"kind\": \"OptionOccurrence\",  \"path\": [    \"ZIO-WorkflowGuidanceModel\",    \"Class Componentization and Integration View\",    \"SOA Design Decisions\",    \"Option Occurrence1\"  ],  \"attributes\": {    \"XModelId\": \"ADMentor:2\"  },  \"notes\": \"\",  \"state\": \"Eligible\"}" localhost:9940/element
curl -sS -H "Content-Type: application/json;charset=UTF-8" --data-binary "{  \"kind\": \"ProblemOccurrence\",  \"path\": [    \"ZIO-WorkflowGuidanceModel\",    \"Class Componentization and Integration View\",    \"SOA Design Decisions\",    \"Service Interface Granularity\"  ],  \"attributes\": {    \"Due Date\": \"\",    \"XModelId\": \"ADMentor:2\",    \"Revision Date\": \"\"  },  \"notes\": \"<b>Issue: </b><b><i>In Message Granularity</i></b><b> (Conceptual/Technology Level)</b>\r<b>How many message parts should be defined in the service contract? </b>\rHow deep should the part elements be structured?\r<b>The four alternatives have not been published as patterns yet.</b>\"}" localhost:9940/element
curl -sS -H "Content-Type: application/json;charset=UTF-8" --data-binary "{  \"kind\": \"ProblemOccurrence\",  \"path\": [    \"ZIO-WorkflowGuidanceModel\",    \"Class Componentization and Integration View\",    \"SOA Design Decisions\",    \"Service Scope Granularity OCC1\"  ],  \"attributes\": {    \"Due Date\": \"\",    \"XModelId\": \"ADMentor:2\",    \"Revision Date\": \"\"  },  \"notes\": \"\"}" localhost:9940/element
curl -sS -H "Content-Type: application/json;charset=UTF-8" --data-binary "{  \"kind\": \"ProblemOccurrence\",  \"path\": [    \"ZIO-WorkflowGuidanceModel\",    \"Class Componentization and Integration View\",    \"SOA Design Decisions\",    \"Service Scope Granularity OCC2\"  ],  \"attributes\": {    \"Project Stage\": \"SPRINT1\",    \"Due Date\": \"\",    \"XModelId\": \"ADMentor:2\",    \"Revision Date\": \"\"  },  \"notes\": \"ZIO HERE\"}" localhost:9940/element
curl -sS -H "Content-Type: application/json;charset=UTF-8" --data-binary "{  \"kind\": \"OptionTemplate\",  \"path\": [    \"ZIO-WorkflowGuidanceModel\",    \"Class Componentization and Integration View\",    \"Integration Design Decisions\",    \"ActiveMQ\"  ],  \"attributes\": {    \"Intellectual Property Rights\": \"Unrestricted\",    \"XModelId\": \"ADMentor:0.2.0\"  },  \"notes\": \"\"}" localhost:9940/element
curl -sS -H "Content-Type: application/json;charset=UTF-8" --data-binary "{  \"kind\": \"OptionTemplate\",  \"path\": [    \"ZIO-WorkflowGuidanceModel\",    \"Class Componentization and Integration View\",    \"Integration Design Decisions\",    \"CommercialMOM\"  ],  \"attributes\": {    \"Intellectual Property Rights\": \"Unrestricted\",    \"XModelId\": \"ADMentor:0.2.0\"  },  \"notes\": \"\"}" localhost:9940/element
curl -sS -H "Content-Type: application/json;charset=UTF-8" --data-binary "{  \"kind\": \"OptionTemplate\",  \"path\": [    \"ZIO-WorkflowGuidanceModel\",    \"Class Componentization and Integration View\",    \"Integration Design Decisions\",    \"File Transfer\"  ],  \"attributes\": {    \"Intellectual Property Rights\": \"Unrestricted\",    \"XModelId\": \"ADMentor:0.2.0\"  },  \"notes\": \"\"}" localhost:9940/element
curl -sS -H "Content-Type: application/json;charset=UTF-8" --data-binary "{  \"kind\": \"ProblemTemplate\",  \"path\": [    \"ZIO-WorkflowGuidanceModel\",    \"Class Componentization and Integration View\",    \"Integration Design Decisions\",    \"Integration Style\"  ],  \"attributes\": {    \"Owner Role\": \"Any\",    \"Intellectual Property Rights\": \"Unrestricted\",    \"Project Stage\": \"\",    \"XModelId\": \"ADMentor:0.2.0\",    \"Stakeholder Roles\": \"Any\",    \"Organisational Reach\": \"Project\",    \"Viewpoint\": \"\"  },  \"notes\": \"\"}" localhost:9940/element
curl -sS -H "Content-Type: application/json;charset=UTF-8" --data-binary "{  \"kind\": \"OptionTemplate\",  \"path\": [    \"ZIO-WorkflowGuidanceModel\",    \"Class Componentization and Integration View\",    \"Integration Design Decisions\",    \"Messaging\"  ],  \"attributes\": {    \"Intellectual Property Rights\": \"Unrestricted\",    \"XModelId\": \"ADMentor:0.2.0\"  },  \"notes\": \"\"}" localhost:9940/element
curl -sS -H "Content-Type: application/json;charset=UTF-8" --data-binary "{  \"kind\": \"ProblemTemplate\",  \"path\": [    \"ZIO-WorkflowGuidanceModel\",    \"Class Componentization and Integration View\",    \"Integration Design Decisions\",    \"Messaging System\"  ],  \"attributes\": {    \"Owner Role\": \"Any\",    \"Intellectual Property Rights\": \"Unrestricted\",    \"Project Stage\": \"\",    \"XModelId\": \"ADMentor:0.2.0\",    \"Stakeholder Roles\": \"Any\",    \"Organisational Reach\": \"Project\",    \"Viewpoint\": \"\"  },  \"notes\": \"\"}" localhost:9940/element
curl -sS -H "Content-Type: application/json;charset=UTF-8" --data-binary "{  \"kind\": \"OptionTemplate\",  \"path\": [    \"ZIO-WorkflowGuidanceModel\",    \"Class Componentization and Integration View\",    \"Integration Design Decisions\",    \"RabbitMQ\"  ],  \"attributes\": {    \"Intellectual Property Rights\": \"Unrestricted\",    \"XModelId\": \"ADMentor:0.2.0\"  },  \"notes\": \"\"}" localhost:9940/element
curl -sS -H "Content-Type: application/json;charset=UTF-8" --data-binary "{  \"kind\": \"OptionTemplate\",  \"path\": [    \"ZIO-WorkflowGuidanceModel\",    \"Class Componentization and Integration View\",    \"Integration Design Decisions\",    \"RPC\"  ],  \"attributes\": {    \"Intellectual Property Rights\": \"Unrestricted\",    \"XModelId\": \"ADMentor:0.2.0\"  },  \"notes\": \"\"}" localhost:9940/element
curl -sS -H "Content-Type: application/json;charset=UTF-8" --data-binary "{  \"kind\": \"OptionTemplate\",  \"path\": [    \"ZIO-WorkflowGuidanceModel\",    \"Class Componentization and Integration View\",    \"Integration Design Decisions\",    \"Shared Database\"  ],  \"attributes\": {    \"Intellectual Property Rights\": \"Unrestricted\",    \"XModelId\": \"ADMentor:0.2.0\"  },  \"notes\": \"\"}" localhost:9940/element
curl -sS --request PUT localhost:9940/element/22/relation/AddressedBy/23
curl -sS --request PUT localhost:9940/element/22/relation/AddressedBy/23
curl -sS --request PUT localhost:9940/element/22/relation/AddressedBy/24
curl -sS --request PUT localhost:9940/element/44/relation/AddressedBy/23
curl -sS --request PUT localhost:9940/element/43/relation/AddressedBy/23
curl -sS --request PUT localhost:9940/element/43/relation/AddressedBy/24
curl -sS --request PUT localhost:9940/element/44/relation/AddressedBy/24
curl -sS --request PUT localhost:9940/element/43/relation/Raises/42
curl -sS --request PUT localhost:9940/element/43/relation/AddressedBy/23
curl -sS --request PUT localhost:9940/element/43/relation/AddressedBy/24
curl -sS --request PUT localhost:9940/element/44/relation/AddressedBy/23
curl -sS --request PUT localhost:9940/element/44/relation/AddressedBy/24
curl -sS --request PUT localhost:9940/element/37/relation/AddressedBy/32
curl -sS --request PUT localhost:9940/element/37/relation/AddressedBy/33
curl -sS --request PUT localhost:9940/element/35/relation/AddressedBy/34
curl -sS --request PUT localhost:9940/element/35/relation/AddressedBy/40
curl -sS --request PUT localhost:9940/element/35/relation/AddressedBy/34
curl -sS --request PUT localhost:9940/element/35/relation/AddressedBy/39
curl -sS --request PUT localhost:9940/element/35/relation/AddressedBy/36
curl -sS --request PUT localhost:9940/element/36/relation/Raises/37
curl -sS --request PUT localhost:9940/element/36/relation/Raises/37
curl -sS --request PUT localhost:9940/element/37/relation/AddressedBy/32
curl -sS --request PUT localhost:9940/element/37/relation/AddressedBy/33
curl -sS --request PUT localhost:9940/element/37/relation/AddressedBy/38
curl -sS --request PUT localhost:9940/element/35/relation/AddressedBy/39
curl -sS --request PUT localhost:9940/element/35/relation/AddressedBy/40
curl -sS --request PUT localhost:9940/element/23/relation/HasTemplate/23
curl -sS --request PUT localhost:9940/element/24/relation/HasTemplate/24
curl -sS --request PUT localhost:9940/element/43/relation/HasTemplate/22
curl -sS --request PUT localhost:9940/element/44/relation/HasTemplate/22


echo "||==================================================||"
echo "|| ADRepo is now available at http://localhost:9940 ||"
echo "||==================================================||"

sudo apt-get -yqq autoremove
